import { POWER_UPS } from './powerups.js'

/**
 * Modos de juego como recetas sobre el motor del Clásico.
 *   shop     ids de power-ups de la tiendita entre niveles (null = sin tiendita)
 *   boardId  tabla de campeones donde se guardan sus partidas
 *   comingSoon  true = se ve en el menú, deshabilitado, con "Próximamente"
 * Un modo nuevo es una entrada más; aparece solo en el menú.
 */
export const MODES = [
  {
    id: 'clasico',
    name: 'Clásico',
    description: 'Rompe piñatas contra el reloj',
    rules: 'Cada nivel tienes 10 segundos y la piñata aguanta más golpes. ¿Hasta dónde llegas?',
    shop: null,
    boardId: 'clasico',
  },
  {
    id: 'fiesta',
    name: 'Fiesta',
    description: 'Con tiendita de power-ups',
    rules: 'Como el clásico, pero entre niveles gastas tus dulces en un power-up para el siguiente nivel. Solo uno por nivel.',
    shop: POWER_UPS.map((p) => p.id),
    boardId: 'fiesta',
    comingSoon: true,
  },
]

export function getMode(id) {
  return MODES.find((m) => m.id === id) ?? MODES[0]
}
