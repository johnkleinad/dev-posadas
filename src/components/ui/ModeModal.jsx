import Leaderboard from './Leaderboard.jsx'
import Modal, { ComicButton } from './Modal.jsx'

/** Pantalla 2 del menú: reglas del modo, ¡Jugar! y la tabla de campeones de ese modo. */
export default function ModeModal({ mode, board, onPlay, onBack }) {
  return (
    <Modal>
      <button type="button" onClick={onBack} className="text-sm font-extrabold text-morado underline-offset-2 hover:underline">
        ← Modos
      </button>
      <h1 id="modal-title" className="text-center font-comic text-5xl leading-none tracking-wide text-rosa [text-shadow:2px_2px_0_#1A1A1A]">
        Modo {mode.name}
      </h1>
      <p className="mt-3 text-center font-extrabold text-tinta/80">{mode.rules}</p>
      <p className="mt-1 text-center text-sm font-extrabold text-tinta/60">Toca la pantalla (o haz clic) lo más rápido que puedas</p>
      <ComicButton className="mt-4" color="bg-rosa text-white!" onClick={onPlay}>
        ¡Jugar!
      </ComicButton>
      <Leaderboard {...board} />
    </Modal>
  )
}
