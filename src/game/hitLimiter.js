/** Devuelve una función que acepta como máximo `max` golpes por ventana de `windowMs`. */
export function createHitLimiter({ max = 20, windowMs = 1000 } = {}) {
  const accepted = []
  return (nowMs) => {
    while (accepted.length && accepted[0] <= nowMs - windowMs) accepted.shift()
    if (accepted.length >= max) return false
    accepted.push(nowMs)
    return true
  }
}
