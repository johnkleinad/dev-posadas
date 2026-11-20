export const LEVEL_SECONDS = 10
export const COUNTDOWN_SECONDS = 3

/** Golpes necesarios para romper la piñata del nivel `level` (1-based). */
export function hitsRequired(level) {
  return 15 + 6 * (level - 1)
}

/** Puntos por superar `level` con `secondsLeft` segundos sobrantes. */
export function levelPoints(level, secondsLeft) {
  return 100 * level + Math.round(Math.max(0, secondsLeft) * 50)
}

/** 0 = intacta, 1 = grietas, 2 = huecos, 3 = rota. */
export function damageStage(hits, required) {
  const ratio = hits / required
  if (ratio >= 1) return 3
  if (ratio >= 2 / 3) return 2
  if (ratio >= 1 / 3) return 1
  return 0
}
