import { COUNTDOWN_SECONDS, LEVEL_SECONDS } from './rules.js'

/** Segundos de cuenta regresiva (3..0). Acotado por si el reloj de la vista está atrasado. */
export function countdownLeftAt(state, now) {
  if (state.phase !== 'countdown') return 0
  const left = Math.ceil((state.countdownEndsAt - now) / 1000)
  return Math.min(COUNTDOWN_SECONDS, Math.max(0, left))
}

/** Segundos restantes del nivel para mostrar en el HUD. */
export function timeLeftAt(state, now) {
  if (state.phase === 'playing') return Math.min(LEVEL_SECONDS, Math.max(0, (state.deadline - now) / 1000))
  if (state.phase === 'levelCleared') return state.secondsLeftAtBreak
  if (state.phase === 'gameOver') return 0
  return LEVEL_SECONDS
}
