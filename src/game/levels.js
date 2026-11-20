export const PINATAS = ['estrella', 'burro', 'estrellaDorada', 'olla', 'santa']

const C = {
  rosa: '#E4007C',
  naranja: '#FF7A00',
  cempasuchil: '#FFC20E',
  verde: '#0B8A3E',
  rojo: '#D7263D',
  morado: '#6A2C91',
  turquesa: '#00A6A6',
}

/** Cada paleta: [principal, secundario, acento, detalle]. */
export const PALETTES = [
  [C.rosa, C.cempasuchil, C.turquesa, C.naranja],
  [C.morado, C.verde, C.cempasuchil, C.rojo],
  [C.turquesa, C.rojo, C.naranja, C.rosa],
]

export function levelTheme(level) {
  const i = level - 1
  return {
    pinata: PINATAS[i % PINATAS.length],
    palette: PALETTES[Math.floor(i / PINATAS.length) % PALETTES.length],
    backgroundIndex: i % 5,
  }
}
