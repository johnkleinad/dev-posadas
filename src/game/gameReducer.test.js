import { describe, expect, it } from 'vitest'
import { gameReducer, initialState } from './gameReducer.js'

const play = () => {
  let s = gameReducer(initialState, { type: 'START', now: 0 })
  s = gameReducer(s, { type: 'TICK', now: 3000 })
  return s
}

describe('gameReducer', () => {
  it('START abre la cuenta regresiva en el nivel 1', () => {
    const s = gameReducer(initialState, { type: 'START', now: 0 })
    expect(s).toMatchObject({ phase: 'countdown', level: 1, hits: 0, required: 15, points: 0, countdownEndsAt: 3000 })
  })

  it('ignora golpes durante la cuenta regresiva', () => {
    const s = gameReducer(initialState, { type: 'START', now: 0 })
    expect(gameReducer(s, { type: 'HIT', now: 100 }).hits).toBe(0)
  })

  it('al terminar la cuenta arranca 10 s de juego', () => {
    const s = play()
    expect(s.phase).toBe('playing')
    expect(s.deadline).toBe(13000)
  })

  it('el último golpe justo antes del límite rompe la piñata', () => {
    let s = play()
    for (let i = 0; i < 14; i++) s = gameReducer(s, { type: 'HIT', now: 4000 })
    s = gameReducer(s, { type: 'HIT', now: 12999.9 })
    expect(s.phase).toBe('levelCleared')
    expect(s.levelsCleared).toBe(1)
    expect(s.points).toBe(100)
    expect(s.lastLevelPoints).toBe(100)
    expect(gameReducer(s, { type: 'HIT', now: 13000 }).hits).toBe(15)
  })

  it('suma bonus por segundos sobrantes', () => {
    let s = play()
    for (let i = 0; i < 15; i++) s = gameReducer(s, { type: 'HIT', now: 9000 })
    expect(s.points).toBe(100 + 200)
    expect(s.secondsLeftAtBreak).toBe(4)
  })

  it('NEXT_LEVEL sube de nivel y pide más golpes', () => {
    let s = play()
    for (let i = 0; i < 15; i++) s = gameReducer(s, { type: 'HIT', now: 4000 })
    s = gameReducer(s, { type: 'NEXT_LEVEL', now: 20000 })
    expect(s).toMatchObject({ level: 2, hits: 0, required: 21, phase: 'countdown', countdownEndsAt: 23000 })
  })

  it('un golpe en el instante del límite no cuenta', () => {
    const s = play()
    expect(gameReducer(s, { type: 'HIT', now: 13000 }).hits).toBe(0)
  })

  it('se acaba la partida al vencer el tiempo, aunque el TICK llegue tarde', () => {
    const s = play()
    expect(gameReducer(s, { type: 'TICK', now: 12000 }).phase).toBe('playing')
    expect(gameReducer(s, { type: 'TICK', now: 999999 }).phase).toBe('gameOver')
  })

  it('TO_MENU vuelve al estado inicial', () => {
    expect(gameReducer(play(), { type: 'TO_MENU' })).toEqual(initialState)
  })
})
