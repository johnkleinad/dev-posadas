import { describe, expect, it } from 'vitest'
import { MODES, getMode } from './modes.js'
import { getPowerUp } from './powerups.js'

describe('modos', () => {
  it('Clásico y Fiesta, en ese orden', () => {
    expect(MODES.map((m) => m.id)).toEqual(['clasico', 'fiesta'])
  })

  it('un id desconocido cae en Clásico', () => {
    expect(getMode('x').id).toBe('clasico')
  })

  it('Clásico no tiene tiendita; Fiesta tiene los 6 power-ups', () => {
    expect(getMode('clasico').shop).toBeNull()
    const shop = getMode('fiesta').shop
    expect(shop).toHaveLength(6)
    for (const id of shop) expect(getPowerUp(id)).not.toBeNull()
  })

  it('cada modo guarda en su propia tabla', () => {
    expect(getMode('clasico').boardId).toBe('clasico')
    expect(getMode('fiesta').boardId).toBe('fiesta')
  })
})
