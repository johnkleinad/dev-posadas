import { describe, expect, it } from 'vitest'
import { gameReducer, initialState } from './gameReducer.js'
import { countdownLeftAt } from './clock.js'

describe('countdownLeftAt', () => {
  it('nunca muestra más de 3 aunque el reloj de la vista esté atrasado', () => {
    const s = gameReducer(initialState, { type: 'START', now: 60000 })
    // la vista aún tiene la hora vieja (del menú): 0 ms
    expect(countdownLeftAt(s, 0)).toBe(3)
  })
  it('cuenta 3, 2, 1 conforme pasa el tiempo', () => {
    const s = gameReducer(initialState, { type: 'START', now: 0 })
    expect(countdownLeftAt(s, 100)).toBe(3)
    expect(countdownLeftAt(s, 1500)).toBe(2)
    expect(countdownLeftAt(s, 2500)).toBe(1)
  })
})
