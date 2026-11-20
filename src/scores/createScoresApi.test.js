import { describe, expect, it, vi } from 'vitest'
import { createScoresApi } from './createScoresApi.js'

const fakeClient = (list, create = vi.fn()) => ({ models: { Score: { list, create } } })
const row = (name, level, points) => ({ id: name, name, level, points, createdAt: '2026-11-20T10:00:00Z' })

describe('createScoresApi', () => {
  it('lee todas las páginas y devuelve el top ordenado', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ data: [row('A', 1, 100)], nextToken: 't' })
      .mockResolvedValueOnce({ data: [row('B', 4, 900)], nextToken: null })
    const res = await createScoresApi(fakeClient(list)).fetchTopScores()
    expect(res.ok).toBe(true)
    expect(res.scores.map((s) => s.name)).toEqual(['B', 'A'])
    expect(list).toHaveBeenLastCalledWith({ limit: 1000, nextToken: 't' })
  })

  it('no lanza si falla la red', async () => {
    const list = vi.fn().mockRejectedValue(new Error('Network'))
    const res = await createScoresApi(fakeClient(list)).fetchTopScores()
    expect(res.ok).toBe(false)
    expect(res.error).toBeTruthy()
  })

  it('reporta errores de GraphQL como falla', async () => {
    const list = vi.fn().mockResolvedValue({ data: null, errors: [{ message: 'Unauthorized' }] })
    const res = await createScoresApi(fakeClient(list)).fetchTopScores()
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('rechaza nombres vacíos sin llamar a la red', async () => {
    const create = vi.fn()
    const res = await createScoresApi(fakeClient(vi.fn(), create)).submitScore({ name: '  ', level: 1, points: 100 })
    expect(res.ok).toBe(false)
    expect(create).not.toHaveBeenCalled()
  })

  it('guarda el nombre limpio', async () => {
    const create = vi.fn().mockResolvedValue({ data: row('Ana', 2, 300) })
    const res = await createScoresApi(fakeClient(vi.fn(), create)).submitScore({ name: ' Ana ', level: 2, points: 300 })
    expect(create).toHaveBeenCalledWith({ name: 'Ana', level: 2, points: 300 })
    expect(res).toEqual({ ok: true, score: row('Ana', 2, 300) })
  })

  it('no lanza si falla al guardar', async () => {
    const create = vi.fn().mockRejectedValue(new Error('Network'))
    const res = await createScoresApi(fakeClient(vi.fn(), create)).submitScore({ name: 'Ana', level: 2, points: 300 })
    expect(res.ok).toBe(false)
  })
})
