import { useCallback, useEffect, useState } from 'react'

/** Carga la tabla completa (ordenada) para mostrar el top 10 y calcular tu lugar. */
export function useLeaderboard(api, active) {
  const [board, setBoard] = useState({ status: 'loading', scores: [] })

  const reload = useCallback(async () => {
    setBoard((b) => ({ ...b, status: 'loading' }))
    const res = await api.fetchTopScores(1000)
    setBoard(res.ok ? { status: 'ok', scores: res.scores } : { status: 'error', scores: [] })
  }, [api])

  useEffect(() => {
    if (!active) return
    let cancelled = false
    api.fetchTopScores(1000).then((res) => {
      if (!cancelled) setBoard(res.ok ? { status: 'ok', scores: res.scores } : { status: 'error', scores: [] })
    })
    return () => {
      cancelled = true
    }
  }, [api, active])

  const submit = useCallback(
    async (entry) => {
      const res = await api.submitScore(entry)
      if (res.ok) await reload()
      return res
    },
    [api, reload],
  )

  return { board: { ...board, onRetry: reload }, submit }
}
