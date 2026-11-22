import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { gameReducer, initialState } from './gameReducer.js'
import { countdownLeftAt, isFrozen, timeLeftAt } from './clock.js'

/**
 * Hook del juego: reducer + reloj con requestAnimationFrame.
 * `timeLeft` (segundos) y `countdownLeft` (entero 3..0) se recalculan en cada frame.
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [now, setNow] = useState(() => performance.now())
  const stateRef = useRef(state)
  useLayoutEffect(() => {
    stateRef.current = state
  }, [state])

  const running = state.phase === 'countdown' || state.phase === 'playing'

  useEffect(() => {
    if (!running) return
    let raf
    const loop = () => {
      const t = performance.now()
      setNow(t)
      dispatch({ type: 'TICK', now: t })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running])

  /** Empieza una partida; sin `modeId` repite el modo actual. */
  const start = useCallback((modeId) => {
    dispatch({ type: 'START', now: performance.now(), modeId })
  }, [])

  const hit = useCallback(() => {
    const s = stateRef.current
    const t = performance.now()
    if (s.phase !== 'playing' || t >= s.deadline) return false
    dispatch({ type: 'HIT', now: t, playerId: 'local' })
    return true
  }, [])

  const nextLevel = useCallback(() => dispatch({ type: 'NEXT_LEVEL', now: performance.now() }), [])
  const toMenu = useCallback(() => dispatch({ type: 'TO_MENU' }), [])
  const buy = useCallback((powerUpId) => dispatch({ type: 'BUY', powerUpId }), [])

  const timeLeft = timeLeftAt(state, now)
  const countdownLeft = countdownLeftAt(state, now)
  const sinceStart = state.phase === 'playing' ? now - state.levelStartedAt : Infinity
  const frozen = isFrozen(state, now)

  return { state, start, hit, nextLevel, toMenu, buy, timeLeft, countdownLeft, sinceStart, frozen }
}
