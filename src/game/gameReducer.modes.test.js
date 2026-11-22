import { describe, expect, it } from 'vitest'
import { gameReducer, initialState } from './gameReducer.js'
import { shownSecondsLeft, timeLeftAt } from './clock.js'

const r = gameReducer
const hitN = (s, n, now) => {
  for (let i = 0; i < n; i++) s = r(s, { type: 'HIT', now, playerId: 'local' })
  return s
}
/** Fiesta: nivel 1 jugado (arranca en 3000, deadline 13000). */
const fiestaPlaying = () => r(r(initialState, { type: 'START', now: 0, modeId: 'fiesta' }), { type: 'TICK', now: 3000 })
/** Fiesta: nivel 1 roto en 10000 → 3 s mostrados → 250 dulces. */
const fiestaCleared = () => hitN(fiestaPlaying(), 15, 10000)
/** Compra `id`, pasa al siguiente nivel y arranca el juego en `start`. */
const buyAndPlay = (s, id, start) => {
  if (id) s = r(s, { type: 'BUY', powerUpId: id })
  s = r(s, { type: 'NEXT_LEVEL', now: start - 3000 })
  return r(s, { type: 'TICK', now: start })
}

describe('motor con modos', () => {
  it('START sin modo es Clásico', () => {
    const s = r(initialState, { type: 'START', now: 0 })
    expect(s).toMatchObject({ modeId: 'clasico', wallet: 0, levelSeconds: 10, players: [{ id: 'local' }] })
  })

  it('los dulces ganados van a points y a wallet', () => {
    expect(fiestaCleared()).toMatchObject({ phase: 'levelCleared', points: 250, wallet: 250 })
  })

  it('BUY cobra precio × siguiente nivel y solo una vez', () => {
    let s = r(fiestaCleared(), { type: 'BUY', powerUpId: 'velita' })
    expect(s).toMatchObject({ wallet: 170, pending: 'velita' })
    expect(r(s, { type: 'BUY', powerUpId: 'escarcha' })).toBe(s)
    s = r(s, { type: 'NEXT_LEVEL', now: 20000 })
    s = r(s, { type: 'TICK', now: 23000 })
    expect(s).toMatchObject({ active: 'velita', pending: null, levelSeconds: 12, deadline: 35000, points: 250 })
  })

  it('BUY inválido no cambia el estado', () => {
    const cleared = fiestaCleared()
    expect(r(cleared, { type: 'BUY', powerUpId: 'xyz' })).toBe(cleared)
    const broke = { ...cleared, wallet: 100 }
    expect(r(broke, { type: 'BUY', powerUpId: 'tamarindo' })).toBe(broke) // 180
    const playing = fiestaPlaying()
    expect(r(playing, { type: 'BUY', powerUpId: 'velita' })).toBe(playing)
    let classic = r(r(initialState, { type: 'START', now: 0 }), { type: 'TICK', now: 3000 })
    classic = hitN(classic, 15, 10000)
    expect(r(classic, { type: 'BUY', powerUpId: 'velita' })).toBe(classic)
  })

  it('Tamarindo: cada golpe vale 2 y el contador topa en lo requerido', () => {
    let s = buyAndPlay(fiestaCleared(), 'tamarindo', 30000)
    expect(s.required).toBe(21)
    s = hitN(s, 10, 31000)
    expect(s.hits).toBe(20)
    s = hitN(s, 1, 31000)
    expect(s).toMatchObject({ hits: 21, phase: 'levelCleared' })
  })

  it('Bengala: triple solo en los últimos 3 s mostrados', () => {
    let s = buyAndPlay(fiestaCleared(), 'bengala', 30000) // deadline 40000
    s = hitN(s, 1, 36000) // 4 s
    expect(s.hits).toBe(1)
    s = hitN(s, 1, 37000) // 3 s
    expect(s.hits).toBe(4)
  })

  it('Ponche baja los golpes requeridos', () => {
    expect(buyAndPlay(fiestaCleared(), 'ponche', 30000).required).toBe(16)
  })

  it('Escarcha congela el reloj mostrado 2 s y el bonus usa lo mostrado', () => {
    let s = buyAndPlay(fiestaCleared(), 'escarcha', 30000)
    expect(s).toMatchObject({ freezeStart: 38000, freezeEnd: 40000, deadline: 42000 })
    expect(shownSecondsLeft(s, 30000)).toBe(10)
    expect(shownSecondsLeft(s, 38000)).toBe(2)
    expect(shownSecondsLeft(s, 39000)).toBe(2)
    expect(shownSecondsLeft(s, 40000)).toBe(2)
    expect(shownSecondsLeft(s, 41000)).toBe(1)
    s = hitN(s, 21, 39000)
    expect(s.lastLevelPoints).toBe(200 + 100)
    expect(s.secondsLeftAtBreak).toBe(2)
  })

  it('Pedir posada repite el nivel una vez y sin power-up', () => {
    let s = buyAndPlay(fiestaCleared(), 'posada', 30000)
    s = r(s, { type: 'TICK', now: 40000 })
    expect(s).toMatchObject({ phase: 'countdown', level: 2, hits: 0, retryUsed: true, retrying: true, wallet: 10 })
    s = r(s, { type: 'TICK', now: 43000 })
    expect(s).toMatchObject({ phase: 'playing', active: null, levelSeconds: 10, freezeStart: null })
    expect(r(s, { type: 'TICK', now: 53000 }).phase).toBe('gameOver')
  })

  it('el reintento no conserva congelación ni segundos extra', () => {
    let s = { ...fiestaCleared(), wallet: 10000 }
    s = buyAndPlay(s, 'escarcha', 30000)
    s = hitN(s, 21, 31000)
    s = buyAndPlay(s, 'posada', 50000)
    s = r(s, { type: 'TICK', now: 60000 })
    s = r(s, { type: 'TICK', now: 63000 })
    expect(s).toMatchObject({ level: 3, active: null, freezeStart: null, freezeEnd: null, levelSeconds: 10, deadline: 73000 })
  })

  it('NEXT_LEVEL reinicia el reintento', () => {
    let s = buyAndPlay(fiestaCleared(), 'posada', 30000)
    s = r(s, { type: 'TICK', now: 40000 })
    s = r(s, { type: 'TICK', now: 43000 })
    s = hitN(s, 21, 44000)
    s = r(s, { type: 'NEXT_LEVEL', now: 50000 })
    expect(s).toMatchObject({ retryUsed: false, retrying: false })
  })

  it('TO_MENU y START sin modo conservan el modo actual', () => {
    const menu = r(fiestaPlaying(), { type: 'TO_MENU' })
    expect(menu).toMatchObject({ phase: 'menu', modeId: 'fiesta', wallet: 0 })
    expect(r(menu, { type: 'START', now: 0 }).modeId).toBe('fiesta')
    expect(r(fiestaCleared(), { type: 'START', now: 0 })).toMatchObject({ modeId: 'fiesta', wallet: 0, points: 0 })
  })

  it('timeLeftAt nunca pasa de la duración del nivel', () => {
    const s = buyAndPlay(fiestaCleared(), 'velita', 30000)
    expect(timeLeftAt(s, 30000)).toBe(12)
    expect(timeLeftAt(s, 0)).toBe(12)
  })
})
