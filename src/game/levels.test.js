import { describe, expect, it } from 'vitest'
import { PINATAS, levelTheme } from './levels.js'

describe('levelTheme', () => {
  it('rota los 5 diseños de piñata', () => {
    expect(PINATAS).toHaveLength(5)
    expect(levelTheme(1).pinata).toBe('estrella')
    expect(levelTheme(5).pinata).toBe('santa')
    expect(levelTheme(6).pinata).toBe('estrella')
  })
  it('cambia de paleta al repetir diseños', () => {
    expect(levelTheme(6).palette).not.toEqual(levelTheme(1).palette)
  })
  it('rota los fondos', () => {
    expect(levelTheme(1).backgroundIndex).toBe(0)
    expect(levelTheme(7).backgroundIndex).toBe(1)
  })
})
