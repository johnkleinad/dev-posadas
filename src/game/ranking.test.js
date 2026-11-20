import { describe, expect, it } from 'vitest'
import { rankScores, topScores } from './ranking.js'

const s = [
  { name: 'A', level: 3, points: 500, createdAt: '2026-11-20T10:00:00Z' },
  { name: 'B', level: 5, points: 100, createdAt: '2026-11-20T10:00:00Z' },
  { name: 'C', level: 3, points: 900, createdAt: '2026-11-20T10:00:00Z' },
  { name: 'D', level: 3, points: 900, createdAt: '2026-11-20T09:00:00Z' },
]

describe('ranking', () => {
  it('ordena por nivel, luego puntos, luego quien llegó primero', () => {
    expect(rankScores(s).map((x) => x.name)).toEqual(['B', 'D', 'C', 'A'])
  })
  it('recorta al top n', () => {
    expect(topScores(s, 2).map((x) => x.name)).toEqual(['B', 'D'])
  })
  it('no muta la lista original', () => {
    rankScores(s)
    expect(s[0].name).toBe('A')
  })
})
