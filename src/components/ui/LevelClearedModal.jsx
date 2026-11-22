import { useState } from 'react'
import { getMode } from '../../game/modes.js'
import Modal, { ComicButton } from './Modal.jsx'
import Shop from './Shop.jsx'

/** Nivel superado: dulces ganados y, si el modo tiene tiendita, la elección de power-up. */
export default function LevelClearedModal({ state, onNext }) {
  const { level, lastLevelPoints, secondsLeftAtBreak, points, wallet, modeId } = state
  const shop = getMode(modeId).shop
  const [selected, setSelected] = useState(null)
  const bonus = lastLevelPoints - 100 * level
  return (
    <Modal title={`¡Nivel ${level} superado!`} delay={0.9}>
      <div className="mt-3 rounded-xl border-3 border-tinta bg-white p-3 text-center font-extrabold">
        <div className="font-comic text-5xl tracking-wide text-verde">+{lastLevelPoints} dulces</div>
        <div className="text-sm text-tinta/70">
          {100 * level} por el nivel + {bonus} de bonus por {secondsLeftAtBreak.toFixed(1)} s sobrantes
        </div>
        <div className="mt-2 text-tinta">
          Total juntado: <span className="font-comic text-2xl tracking-wide text-rosa">{points}</span> dulces
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-extrabold text-tinta/70">La siguiente piñata aguanta más golpes. ¡Prepárate!</p>
      {shop && <Shop shop={shop} level={level + 1} wallet={wallet} selected={selected} onSelect={setSelected} />}
      {/* Fijo abajo: con la tiendita el modal se desplaza y el botón debe seguir a la vista. */}
      <div className="sticky -bottom-5 -mx-5 mt-3 bg-crema px-5 pt-2 pb-5">
        <ComicButton onClick={() => onNext(selected)}>Siguiente nivel</ComicButton>
      </div>
    </Modal>
  )
}
