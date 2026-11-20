import { COUNTDOWN_SECONDS, LEVEL_SECONDS, hitsRequired, levelPoints } from './rules.js'

export const initialState = {
  phase: 'menu', // 'menu' | 'countdown' | 'playing' | 'levelCleared' | 'gameOver'
  level: 1,
  hits: 0,
  required: hitsRequired(1),
  points: 0,
  levelsCleared: 0,
  countdownEndsAt: null,
  deadline: null,
  lastLevelPoints: 0,
  secondsLeftAtBreak: 0,
}

function beginCountdown(state, level, now) {
  return {
    ...state,
    phase: 'countdown',
    level,
    hits: 0,
    required: hitsRequired(level),
    countdownEndsAt: now + COUNTDOWN_SECONDS * 1000,
    deadline: null,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START':
      return beginCountdown(initialState, 1, action.now)

    case 'TICK':
      if (state.phase === 'countdown' && action.now >= state.countdownEndsAt) {
        return { ...state, phase: 'playing', deadline: action.now + LEVEL_SECONDS * 1000 }
      }
      if (state.phase === 'playing' && action.now >= state.deadline) {
        return { ...state, phase: 'gameOver' }
      }
      return state

    case 'HIT': {
      if (state.phase !== 'playing' || action.now >= state.deadline) return state
      const hits = state.hits + 1
      if (hits < state.required) return { ...state, hits }
      const secondsLeft = (state.deadline - action.now) / 1000
      const gained = levelPoints(state.level, secondsLeft)
      return {
        ...state,
        hits,
        phase: 'levelCleared',
        points: state.points + gained,
        lastLevelPoints: gained,
        secondsLeftAtBreak: secondsLeft,
        levelsCleared: state.levelsCleared + 1,
      }
    }

    case 'NEXT_LEVEL':
      if (state.phase !== 'levelCleared') return state
      return beginCountdown(state, state.level + 1, action.now)

    case 'TO_MENU':
      return initialState

    default:
      return state
  }
}
