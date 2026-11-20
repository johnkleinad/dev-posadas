import { describe, expect, it } from 'vitest'
import { createHitLimiter } from './hitLimiter.js'

describe('createHitLimiter', () => {
  it('acepta máximo 20 golpes por segundo', () => {
    const ok = createHitLimiter()
    const results = Array.from({ length: 25 }, (_, i) => ok(i * 10))
    expect(results.filter(Boolean)).toHaveLength(20)
  })
  it('vuelve a aceptar cuando avanza la ventana', () => {
    const ok = createHitLimiter()
    for (let i = 0; i < 25; i++) ok(i * 10)
    expect(ok(1300)).toBe(true)
  })
})
