import { describe, expect, it } from 'vitest'
import { sanitizeName } from './validation.js'

describe('sanitizeName', () => {
  it('rechaza nombres vacíos', () => {
    expect(sanitizeName('   ')).toBeNull()
    expect(sanitizeName('\u0000\u0007')).toBeNull()
  })
  it('recorta y colapsa espacios', () => {
    expect(sanitizeName('  Juan   Pérez ')).toBe('Juan Pérez')
  })
  it('limita a 20 caracteres, contando emojis como uno', () => {
    expect(sanitizeName('a'.repeat(30))).toHaveLength(20)
    expect(Array.from(sanitizeName('🎉'.repeat(25)))).toHaveLength(20)
  })
})
