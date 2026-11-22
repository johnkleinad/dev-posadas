import { describe, expect, it } from 'vitest'
import { POWER_UPS, getPowerUp, hitValue, levelSetup, priceFor } from './powerups.js'

describe('power-ups', () => {
  it('existen los 6 de la tiendita', () => {
    expect(POWER_UPS.map((p) => p.id)).toEqual(['velita', 'escarcha', 'tamarindo', 'bengala', 'ponche', 'posada'])
    expect(getPowerUp('nada')).toBeNull()
  })

  it('el precio es base × nivel a jugar', () => {
    expect(priceFor('tamarindo', 5)).toBe(450)
    expect(priceFor('velita', 2)).toBe(80)
  })

  it('levelSetup sin power-up es el Clásico', () => {
    expect(levelSetup(1, null)).toEqual({ required: 15, levelSeconds: 10 })
  })

  it('Velita da 12 s', () => {
    expect(levelSetup(1, getPowerUp('velita')).levelSeconds).toBe(12)
  })

  it('Ponche pide 25 % menos golpes, redondeado hacia arriba', () => {
    expect(levelSetup(1, getPowerUp('ponche')).required).toBe(12)
    expect(levelSetup(2, getPowerUp('ponche')).required).toBe(16)
  })

  it('valor del golpe según multiplicadores', () => {
    expect(hitValue(null, 5)).toBe(1)
    expect(hitValue(getPowerUp('tamarindo'), 9)).toBe(2)
    expect(hitValue(getPowerUp('bengala'), 3.01)).toBe(1)
    expect(hitValue(getPowerUp('bengala'), 3)).toBe(3)
  })
})
