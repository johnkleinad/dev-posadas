import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const toBoard = (boardId, res) => (res.ok ? { boardId, status: 'ok', scores: res.scores } : { boardId, status: 'error', scores: [] })

/** Carga la tabla del modo (`boardId`), ordenada, para mostrar el top 10 y calcular tu lugar. */
export function useLeaderboard(api, active, boardId = 'clasico') {
  const [board, setBoard] = useState({ boardId: null, status: 'loading', scores: [] })
  // Tabla que se está mostrando: una recarga que termina tarde para otro modo se descarta.
  const currentBoard = useRef(boardId)
  useLayoutEffect(() => {
    currentBoard.current = boardId
  }, [boardId])

  const reload = useCallback(async () => {
    setBoard((b) => (b.boardId === boardId ? { ...b, status: 'loading' } : b))
    const res = await api.fetchTopScores(1000, boardId)
    if (currentBoard.current === boardId) setBoard(toBoard(boardId, res))
  }, [api, boardId])

  useEffect(() => {
    if (!active) return
    let cancelled = false
    api.fetchTopScores(1000, boardId).then((res) => {
      if (!cancelled) setBoard(toBoard(boardId, res))
    })
    return () => {
      cancelled = true
    }
  }, [api, active, boardId])

  const submit = useCallback(
    async (entry) => {
      const res = await api.submitScore(entry)
      if (res.ok) await reload()
      return res
    },
    [api, reload],
  )

  // Mientras llega la tabla de otro modo, no se muestra la anterior.
  const current = board.boardId === boardId ? board : { status: 'loading', scores: [] }
  return { board: { status: current.status, scores: current.scores, onRetry: reload }, submit }
}
