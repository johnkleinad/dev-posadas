import { getPowerUp, priceFor } from '../../game/powerups.js'
import PowerUpIcon from './powerUpIcons.jsx'

/**
 * Tiendita entre niveles (modo Fiesta). Solo marca la elección; el cobro ocurre al
 * pulsar "Siguiente nivel", así cambiar de opinión no cuesta nada.
 * `level` es el nivel que se va a jugar; los precios son para ese nivel.
 */
export default function Shop({ shop, level, wallet, selected, onSelect }) {
  return (
    <section className="mt-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-comic text-2xl tracking-wide text-morado">Tiendita</h3>
        <span className="text-sm font-extrabold">
          Tienes <b className="font-comic text-lg tracking-wide text-rosa">{wallet}</b> dulces
        </span>
      </div>
      <p className="text-xs font-extrabold text-tinta/60">Uno por nivel, solo para el nivel {level}.</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {shop.map((id) => {
          const p = getPowerUp(id)
          const price = priceFor(id, level)
          const isSelected = selected === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              disabled={price > wallet}
              onClick={() => onSelect(isSelected ? null : id)}
              className={`flex flex-col items-start rounded-xl border-3 border-tinta p-2 text-left shadow-[3px_3px_0_#1A1A1A] transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:shadow-none ${
                isSelected ? 'bg-cempasuchil ring-4 ring-rosa' : 'bg-white'
              }`}
            >
              <span className="flex w-full items-center gap-1">
                <PowerUpIcon id={id} className="h-8 w-8 shrink-0" />
                <span className="font-comic text-lg leading-none tracking-wide">{p.name}</span>
              </span>
              <span className="mt-1 text-xs leading-tight font-extrabold text-tinta/70">{p.description}</span>
              <span className="mt-1 font-comic text-base tracking-wide text-verde">{price} dulces</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
