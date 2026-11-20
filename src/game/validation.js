export const MAX_NAME_LENGTH = 20

/** Limpia el nombre del jugador; devuelve null si queda vacío. */
export function sanitizeName(raw) {
  // eslint-disable-next-line no-control-regex
  const clean = String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim()
  if (!clean) return null
  return Array.from(clean).slice(0, MAX_NAME_LENGTH).join('').trim()
}
