import { LEVEL_SECONDS, hitsRequired } from './rules.js'

/**
 * Power-ups de la tiendita (modo Fiesta). Cada uno es una combinación de
 * efectos genéricos que el motor sabe aplicar:
 *   extraSeconds      segundos extra para el nivel
 *   freezeClock       { atSecondsLeft, seconds }: congela el reloj mostrado
 *   hitMultiplier     { value, lastSeconds? }: cada golpe vale `value` (solo al final si hay lastSeconds)
 *   requiredFactor    multiplica los golpes requeridos (redondeo hacia arriba)
 *   retryOnTimeout    si se acaba el tiempo, se repite el nivel una vez
 * Un power-up nuevo es una entrada más aquí; el motor no cambia.
 */
export const POWER_UPS = [
  { id: 'velita', name: 'Velita', description: '+2 segundos en el nivel', base: 40, effects: { extraSeconds: 2 } },
  { id: 'escarcha', name: 'Escarcha', description: 'Congela el reloj 2 s cuando quedan 2 s', base: 40, effects: { freezeClock: { atSecondsLeft: 2, seconds: 2 } } },
  { id: 'tamarindo', name: 'Dulce de tamarindo', description: 'Cada golpe cuenta doble', base: 90, effects: { hitMultiplier: { value: 2 } } },
  { id: 'bengala', name: 'Luces de bengala', description: 'Golpe triple en los últimos 3 s', base: 50, effects: { hitMultiplier: { value: 3, lastSeconds: 3 } } },
  { id: 'ponche', name: 'Ponche', description: 'La piñata pide 25 % menos golpes', base: 60, effects: { requiredFactor: 0.75 } },
  { id: 'posada', name: 'Pedir posada', description: 'Si se acaba el tiempo, repites el nivel', base: 120, effects: { retryOnTimeout: true } },
]

const BY_ID = new Map(POWER_UPS.map((p) => [p.id, p]))

export function getPowerUp(id) {
  return BY_ID.get(id) ?? null
}

/** Precio en dulces de un power-up para jugar el nivel `level`. */
export function priceFor(id, level) {
  const p = getPowerUp(id)
  return p ? p.base * level : Infinity
}

/** Golpes requeridos y duración del nivel con el power-up activo (o null). */
export function levelSetup(level, powerUp) {
  const fx = powerUp?.effects ?? {}
  const base = hitsRequired(level)
  return {
    required: fx.requiredFactor ? Math.ceil(base * fx.requiredFactor) : base,
    levelSeconds: LEVEL_SECONDS + (fx.extraSeconds ?? 0),
  }
}

/** Cuánto vale un golpe dado el power-up activo y los segundos que muestra el reloj. */
export function hitValue(powerUp, shownSecondsLeft) {
  const m = powerUp?.effects?.hitMultiplier
  if (!m) return 1
  if (m.lastSeconds != null && shownSecondsLeft > m.lastSeconds) return 1
  return m.value
}
