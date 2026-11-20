import { describe, expect, it } from 'vitest'
import { LEVEL_SECONDS, COUNTDOWN_SECONDS, damageStage, hitsRequired, levelPoints } from './rules.js'

describe('reglas del juego', () => {
  it('cada nivel dura 10 s con cuenta de 3', () => {
    expect(LEVEL_SECONDS).toBe(10)
    expect(COUNTDOWN_SECONDS).toBe(3)
  })

  it('pide 15 golpes en el nivel 1 y 6 más por nivel', () => {
    expect(hitsRequired(1)).toBe(15)
    expect(hitsRequired(5)).toBe(39)
    expect(hitsRequired(10)).toBe(69)
  })

  it('da 100 por nivel más 50 por segundo sobrante', () => {
    expect(levelPoints(1, 0)).toBe(100)
    expect(levelPoints(3, 4.26)).toBe(513)
    expect(levelPoints(2, -1)).toBe(200)
  })

  it('calcula la etapa de daño por tercios', () => {
    expect(damageStage(0, 15)).toBe(0)
    expect(damageStage(5, 15)).toBe(1)
    expect(damageStage(10, 15)).toBe(2)
    expect(damageStage(15, 15)).toBe(3)
  })
})
