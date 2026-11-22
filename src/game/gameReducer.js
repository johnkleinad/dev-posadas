import { shownSecondsLeft } from './clock.js'
import { getMode } from './modes.js'
import { getPowerUp, hitValue, levelSetup, priceFor } from './powerups.js'
import { COUNTDOWN_SECONDS, LEVEL_SECONDS, hitsRequired, levelPoints } from './rules.js'

/**
 * Motor del juego: reducer puro con acciones serializables (cada una trae su `now`).
 * Los modos y power-ups son datos (modes.js, powerups.js); aquí solo se aplican sus efectos.
 * `players`/`playerId` quedan listos para el cooperativo; hoy siempre hay un jugador local.
 */
export const initialState = {
  phase: 'menu', // 'menu' | 'countdown' | 'playing' | 'levelCleared' | 'gameOver'
  modeId: 'clasico',
  players: [{ id: 'local' }],
  level: 1,
  hits: 0,
  required: hitsRequired(1),
  levelSeconds: LEVEL_SECONDS,
  points: 0, // dulces juntados en total (lo que va a la tabla)
  wallet: 0, // dulces disponibles para la tiendita
  pending: null, // power-up comprado para el siguiente nivel
  active: null, // power-up del nivel en curso
  levelsCleared: 0,
  countdownEndsAt: null,
  levelStartedAt: null,
  deadline: null,
  freezeStart: null,
  freezeEnd: null,
  retryUsed: false,
  retrying: false,
  lastLevelPoints: 0,
  secondsLeftAtBreak: 0,
}

function beginCountdown(state, level, now) {
  const active = state.pending
  const { required, levelSeconds } = levelSetup(level, getPowerUp(active))
  return {
    ...state,
    phase: 'countdown',
    level,
    hits: 0,
    required,
    levelSeconds,
    active,
    pending: null,
    countdownEndsAt: now + COUNTDOWN_SECONDS * 1000,
    levelStartedAt: null,
    deadline: null,
    freezeStart: null,
    freezeEnd: null,
  }
}

function startPlaying(state, now) {
  const next = { ...state, phase: 'playing', levelStartedAt: now, deadline: now + state.levelSeconds * 1000 }
  const freeze = getPowerUp(state.active)?.effects.freezeClock
  if (!freeze) return next
  const freezeStart = now + (state.levelSeconds - freeze.atSecondsLeft) * 1000
  return { ...next, freezeStart, freezeEnd: freezeStart + freeze.seconds * 1000, deadline: next.deadline + freeze.seconds * 1000 }
}

function timeUp(state) {
  const canRetry = getPowerUp(state.active)?.effects.retryOnTimeout && !state.retryUsed
  if (!canRetry) return { ...state, phase: 'gameOver' }
  return { ...beginCountdown({ ...state, pending: null }, state.level, state.deadline), retryUsed: true, retrying: true }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START':
      return beginCountdown({ ...initialState, modeId: action.modeId ?? state.modeId }, 1, action.now)

    case 'TICK':
      if (state.phase === 'countdown' && action.now >= state.countdownEndsAt) return startPlaying(state, action.now)
      if (state.phase === 'playing' && action.now >= state.deadline) return timeUp(state)
      return state

    case 'HIT': {
      if (state.phase !== 'playing' || action.now >= state.deadline) return state
      const shown = shownSecondsLeft(state, action.now)
      const hits = Math.min(state.required, state.hits + hitValue(getPowerUp(state.active), shown))
      if (hits < state.required) return { ...state, hits }
      const gained = levelPoints(state.level, shown)
      return {
        ...state,
        hits,
        phase: 'levelCleared',
        points: state.points + gained,
        wallet: state.wallet + gained,
        lastLevelPoints: gained,
        secondsLeftAtBreak: shown,
        levelsCleared: state.levelsCleared + 1,
      }
    }

    case 'BUY': {
      const shop = getMode(state.modeId).shop
      const id = action.powerUpId
      if (state.phase !== 'levelCleared' || state.pending || !shop?.includes(id)) return state
      const price = priceFor(id, state.level + 1)
      if (state.wallet < price) return state
      return { ...state, wallet: state.wallet - price, pending: id }
    }

    case 'NEXT_LEVEL':
      if (state.phase !== 'levelCleared') return state
      return { ...beginCountdown(state, state.level + 1, action.now), retryUsed: false, retrying: false }

    case 'TO_MENU':
      return { ...initialState, modeId: state.modeId }

    default:
      return state
  }
}
