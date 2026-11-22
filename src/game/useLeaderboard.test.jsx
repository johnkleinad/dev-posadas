// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLeaderboard } from './useLeaderboard.js'

describe('useLeaderboard', () => {
  it('una recarga tardía de otro modo no pisa la tabla actual', async () => {
    let releaseFiesta
    const fetchTopScores = vi.fn((n, boardId) => {
      if (boardId === 'fiesta' && fetchTopScores.mock.calls.length > 1) {
        return new Promise((res) => (releaseFiesta = () => res({ ok: true, scores: [{ id: 'f', name: 'F' }] })))
      }
      return Promise.resolve({ ok: true, scores: [{ id: boardId, name: boardId }] })
    })
    const api = { fetchTopScores, submitScore: vi.fn().mockResolvedValue({ ok: true, score: { id: 'f' } }) }
    const { result, rerender } = renderHook(({ boardId }) => useLeaderboard(api, true, boardId), { initialProps: { boardId: 'fiesta' } })
    await waitFor(() => expect(result.current.board.status).toBe('ok'))
    let saving
    act(() => {
      saving = result.current.submit({ name: 'F' })
    })
    await waitFor(() => expect(releaseFiesta).toBeTypeOf('function'))
    rerender({ boardId: 'clasico' })
    await waitFor(() => expect(result.current.board.scores[0]?.id).toBe('clasico'))
    await act(async () => {
      releaseFiesta()
      await saving
    })
    expect(result.current.board).toMatchObject({ status: 'ok', scores: [{ id: 'clasico', name: 'clasico' }] })
  })
})
