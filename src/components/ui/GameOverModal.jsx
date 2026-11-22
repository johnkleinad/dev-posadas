import { useRef, useState } from 'react'
import { getMode } from '../../game/modes.js'
import { MAX_NAME_LENGTH, sanitizeName } from '../../game/validation.js'
import Leaderboard from './Leaderboard.jsx'
import Modal, { ComicButton } from './Modal.jsx'

const NAME_KEY = 'pinatas-name'
const readName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function GameOverModal({ state, board, onSave, onRestart, onMenu }) {
  const { levelsCleared, points } = state
  const [name, setName] = useState(readName)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [savedId, setSavedId] = useState(null)
  const busy = useRef(false) // evita doble envío aunque lleguen dos taps antes de re-renderizar
  const canSave = sanitizeName(name) !== null && (saveState === 'idle' || saveState === 'error')

  async function save(e) {
    e.preventDefault()
    if (!canSave || busy.current) return
    busy.current = true
    setSaveState('saving')
    const res = await onSave({ name, level: levelsCleared, points, mode: getMode(state.modeId).boardId })
    busy.current = false
    if (res.ok) {
      setSavedId(res.score.id)
      setSaveState('saved')
      try {
        localStorage.setItem(NAME_KEY, sanitizeName(name))
      } catch {
        /* sin almacenamiento: no pasa nada */
      }
    } else {
      setSaveState('error')
    }
  }

  const rank = savedId ? board.scores.findIndex((s) => s.id === savedId) + 1 : 0

  return (
    <Modal title="¡Se acabó el tiempo!" delay={0.3}>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border-3 border-tinta bg-white p-2">
          <div className="font-comic text-4xl text-morado">{levelsCleared}</div>
          <div className="text-xs font-extrabold text-tinta/70">{levelsCleared === 1 ? 'nivel superado' : 'niveles superados'}</div>
        </div>
        <div className="rounded-xl border-3 border-tinta bg-white p-2">
          <div className="font-comic text-4xl text-rosa">{points}</div>
          <div className="text-xs font-extrabold text-tinta/70">dulces</div>
        </div>
      </div>

      {saveState !== 'saved' ? (
        <form onSubmit={save} className="mt-4">
          <label htmlFor="player-name" className="block text-sm font-extrabold">
            Escribe tu nombre para la tabla
          </label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="nickname"
            enterKeyHint="done"
            placeholder="Tu nombre o apodo"
            className="mt-1 w-full rounded-xl border-3 border-tinta bg-white px-3 py-2 text-lg font-extrabold outline-none focus:ring-4 focus:ring-cempasuchil"
          />
          {saveState === 'error' && <p className="mt-1 text-sm font-extrabold text-rojo">No se pudo guardar. Revisa tu conexión y reintenta.</p>}
          <ComicButton type="submit" className="mt-3" color="bg-verde text-white!" disabled={!canSave}>
            {saveState === 'saving' ? 'Guardando…' : saveState === 'error' ? 'Reintentar' : 'Guardar'}
          </ComicButton>
        </form>
      ) : (
        <p className="mt-4 text-center font-extrabold text-verde">
          ¡Guardado!{rank > 0 && ` Quedaste en el lugar #${rank}.`}
        </p>
      )}

      <Leaderboard {...board} highlightId={savedId} />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ComicButton className="text-2xl" color="bg-rosa text-white!" onClick={onRestart}>
          Otra vez
        </ComicButton>
        <ComicButton className="text-2xl" color="bg-white" onClick={onMenu}>
          Menú
        </ComicButton>
      </div>
    </Modal>
  )
}
