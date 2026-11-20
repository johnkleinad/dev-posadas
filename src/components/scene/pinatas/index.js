import Burro from './Burro.jsx'
import Estrella from './Estrella.jsx'
import EstrellaDorada from './EstrellaDorada.jsx'
import Olla from './Olla.jsx'
import Santa from './Santa.jsx'

export const DESIGNS = { estrella: Estrella, burro: Burro, estrellaDorada: EstrellaDorada, olla: Olla, santa: Santa }

/** Punto (y) donde la cuerda toca cada diseño. */
export const ROPE_END = { estrella: 140, burro: 152, estrellaDorada: 74, olla: 136, santa: 52 }
