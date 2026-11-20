import { topScores } from '../game/ranking.js'
import { sanitizeName } from '../game/validation.js'

const errorMessage = (err) => err?.message || 'Error desconocido'

/**
 * Envuelve el cliente de Amplify Data. Nunca lanza: siempre devuelve
 * `{ ok: true, ... }` o `{ ok: false, error }`.
 */
export function createScoresApi(client) {
  async function fetchTopScores(n = 10) {
    try {
      const all = []
      let nextToken = null
      do {
        const { data, errors, nextToken: next } = await client.models.Score.list({ limit: 1000, nextToken })
        if (errors?.length) return { ok: false, error: errors[0].message }
        all.push(...(data ?? []))
        nextToken = next
      } while (nextToken)
      return { ok: true, scores: topScores(all, n) }
    } catch (err) {
      return { ok: false, error: errorMessage(err) }
    }
  }

  async function submitScore({ name, level, points }) {
    const clean = sanitizeName(name)
    if (!clean) return { ok: false, error: 'Nombre inválido' }
    try {
      const { data, errors } = await client.models.Score.create({
        name: clean,
        level: Math.max(0, Math.trunc(level)),
        points: Math.max(0, Math.trunc(points)),
      })
      if (errors?.length || !data) return { ok: false, error: errors?.[0]?.message ?? 'No se pudo guardar' }
      return { ok: true, score: data }
    } catch (err) {
      return { ok: false, error: errorMessage(err) }
    }
  }

  return { fetchTopScores, submitScore }
}
