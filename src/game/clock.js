import { COUNTDOWN_SECONDS } from './rules.js'

/** Segundos de cuenta regresiva (3..0). Acotado por si el reloj de la vista está atrasado. */
export function countdownLeftAt(state, now) {
  if (state.phase !== 'countdown') return 0
  const left = Math.ceil((state.countdownEndsAt - now) / 1000)
  return Math.min(COUNTDOWN_SECONDS, Math.max(0, left))
}

/** ms de congelación (Escarcha) que aún no han transcurrido en `now`. */
function pendingFreezeMs(state, now) {
  if (state.freezeStart == null) return 0
  const total = state.freezeEnd - state.freezeStart
  return Math.min(total, Math.max(0, state.freezeEnd - Math.max(now, state.freezeStart)))
}

/** Segundos que muestra el reloj del nivel en juego (la congelación no descuenta). */
export function shownSecondsLeft(state, now) {
  const ms = state.deadline - now - pendingFreezeMs(state, now)
  return Math.min(state.levelSeconds, Math.max(0, ms / 1000))
}

/** ¿El reloj está congelado en `now`? */
export function isFrozen(state, now) {
  return state.phase === 'playing' && state.freezeStart != null && now >= state.freezeStart && now < state.freezeEnd
}

/** Segundos restantes del nivel para mostrar en el HUD. */
export function timeLeftAt(state, now) {
  if (state.phase === 'playing') return shownSecondsLeft(state, now)
  if (state.phase === 'levelCleared') return state.secondsLeftAtBreak
  if (state.phase === 'gameOver') return 0
  return state.levelSeconds
}
