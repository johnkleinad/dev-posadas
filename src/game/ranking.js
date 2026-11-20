const time = (iso) => (iso ? Date.parse(iso) : Number.POSITIVE_INFINITY)

/** Orden de la tabla: nivel desc, puntos desc, quien llegó primero. */
export function rankScores(scores) {
  return [...scores].sort(
    (a, b) => b.level - a.level || b.points - a.points || time(a.createdAt) - time(b.createdAt),
  )
}

export function topScores(scores, n = 10) {
  return rankScores(scores).slice(0, n)
}
