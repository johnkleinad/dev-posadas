import Leaderboard from './Leaderboard.jsx'
import Modal, { ComicButton } from './Modal.jsx'

export default function StartModal({ onPlay, board, muted, onToggleMute }) {
  return (
    <Modal>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggleMute}
          className="grid h-10 w-10 place-items-center rounded-full border-3 border-tinta bg-white"
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        >
          <SpeakerIcon muted={muted} />
        </button>
      </div>
      <h1
        id="modal-title"
        className="-mt-2 text-center font-comic text-7xl leading-[0.9] tracking-wide text-cempasuchil [-webkit-text-stroke:3px_#1A1A1A] [text-shadow:5px_5px_0_#E4007C]"
      >
        ¡Dale,
        <br />
        Dale!
      </h1>
      <p className="mt-3 text-center font-extrabold text-tinta/80">
        Rompe la piñata antes de que se acabe el tiempo. Cada nivel tienes <b className="text-rosa">10 segundos</b> y la piñata aguanta más golpes.
      </p>
      <p className="mt-1 text-center text-sm font-extrabold text-tinta/60">Toca la pantalla (o haz clic) lo más rápido que puedas</p>
      <ComicButton className="mt-4" color="bg-rosa text-white!" onClick={onPlay}>
        ¡Jugar!
      </ComicButton>
      <Leaderboard {...board} />
    </Modal>
  )
}

function SpeakerIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#1A1A1A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="#FFC20E" />
      {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />}
    </svg>
  )
}
