import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { gameReducer, initialState } from './gameReducer.js'
import { createHitLimiter } from './hitLimiter.js'
import { LEVEL_SECONDS } from './rules.js'

/**
 * Hook del juego: reducer + reloj con requestAnimationFrame + limitador de golpes.
 * `timeLeft` (segundos) y `countdownLeft` (entero 3..0) se recalculan en cada frame.
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [now, setNow] = useState(() => performance.now())
  const limiter = useRef(createHitLimiter())
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

  const start = useCallback(() => {
    limiter.current = createHitLimiter()
    dispatch({ type: 'START', now: performance.now() })
  }, [])

  const hit = useCallback(() => {
    const s = stateRef.current
    const t = performance.now()
    if (s.phase !== 'playing' || t >= s.deadline) return false
    if (!limiter.current(t)) return false
    dispatch({ type: 'HIT', now: t })
    return true
  }, [])

  const nextLevel = useCallback(() => dispatch({ type: 'NEXT_LEVEL', now: performance.now() }), [])
  const toMenu = useCallback(() => dispatch({ type: 'TO_MENU' }), [])

  let timeLeft = LEVEL_SECONDS
  if (state.phase === 'playing') timeLeft = Math.max(0, (state.deadline - now) / 1000)
  else if (state.phase === 'levelCleared') timeLeft = state.secondsLeftAtBreak
  else if (state.phase === 'gameOver') timeLeft = 0
  const countdownLeft =
    state.phase === 'countdown' ? Math.max(0, Math.ceil((state.countdownEndsAt - now) / 1000)) : 0

  return { state, start, hit, nextLevel, toMenu, timeLeft, countdownLeft }
}
