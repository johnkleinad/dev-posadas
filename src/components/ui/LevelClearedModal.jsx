import Modal, { ComicButton } from './Modal.jsx'

export default function LevelClearedModal({ state, onNext }) {
  const { level, lastLevelPoints, secondsLeftAtBreak, points } = state
  const bonus = lastLevelPoints - 100 * level
  return (
    <Modal title={`¡Nivel ${level} superado!`} delay={0.9}>
      <div className="mt-3 rounded-xl border-3 border-tinta bg-white p-3 text-center font-extrabold">
        <div className="font-comic text-5xl tracking-wide text-verde">+{lastLevelPoints}</div>
        <div className="text-sm text-tinta/70">
          {100 * level} por el nivel + {bonus} de bonus por {secondsLeftAtBreak.toFixed(1)} s sobrantes
        </div>
        <div className="mt-2 text-tinta">
          Total: <span className="font-comic text-2xl tracking-wide text-rosa">{points}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-extrabold text-tinta/70">La siguiente piñata aguanta más golpes. ¡Prepárate!</p>
      <ComicButton className="mt-3" onClick={onNext}>
        Siguiente nivel
      </ComicButton>
    </Modal>
  )
}
