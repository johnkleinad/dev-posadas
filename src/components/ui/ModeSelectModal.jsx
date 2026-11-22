import { MODES } from '../../game/modes.js'
import Modal from './Modal.jsx'

const CARD_COLORS = ['bg-cempasuchil', 'bg-rosa text-white', 'bg-turquesa', 'bg-naranja']

/** Pantalla 1 del menú: título, sonido y una tarjeta por modo (sale del registro de modos). */
export default function ModeSelectModal({ onPick, muted, onToggleMute }) {
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
      <p className="mt-3 text-center font-extrabold text-tinta/80">Elige cómo quieres jugar</p>
      <div className="mt-3 grid gap-3">
        {MODES.map((mode, i) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onPick(mode.id)}
            disabled={mode.comingSoon}
            className={`flex items-center gap-3 rounded-2xl border-4 border-tinta px-4 py-3 text-left shadow-[4px_4px_0_#1A1A1A] transition-transform ${mode.comingSoon ? 'cursor-not-allowed opacity-60 grayscale' : 'active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#1A1A1A]'} ${CARD_COLORS[i % CARD_COLORS.length]}`}
          >
            <ModeIcon id={mode.id} />
            <span>
              <span className="block font-comic text-3xl leading-none tracking-wide">{mode.name}</span>
              <span className="block text-sm font-extrabold opacity-80">{mode.description}</span>
              {mode.comingSoon && (
                <span className="mt-1 block font-comic text-lg leading-none tracking-wide">Próximamente</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

function ModeIcon({ id }) {
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#FFF7E8" stroke="#1A1A1A" strokeWidth="3" />
      {id === 'fiesta' ? (
        <g stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M6 20l6-5v10zM34 20l-6-5v10z" fill="#E4007C" />
          <ellipse cx="20" cy="20" rx="9" ry="7" fill="#FFC20E" />
          <path d="M15 17q5 6 10 0" fill="none" stroke="#D7263D" />
        </g>
      ) : (
        <polygon
          points="20,6 23.5,15 33,15 25.5,21 28.5,31 20,25 11.5,31 14.5,21 7,15 16.5,15"
          fill="#E4007C"
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
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
