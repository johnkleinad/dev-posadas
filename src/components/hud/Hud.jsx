import { getPowerUp } from '../../game/powerups.js'
import PowerUpIcon from '../ui/powerUpIcons.jsx'

/** Barra superior: tiempo restante (número + barra), nivel, golpes y power-up activo. */
export default function Hud({ timeLeft, levelSeconds = 10, level, hits, required, activePowerUp = null, frozen = false }) {
  const pct = Math.max(0, Math.min(1, timeLeft / levelSeconds)) * 100
  const urgent = timeLeft <= 3 && timeLeft > 0 && !frozen
  const power = getPowerUp(activePowerUp)
  return (
    <div className="mx-3 rounded-2xl border-4 border-tinta bg-crema px-3 pt-1 pb-2 shadow-[5px_5px_0_#1A1A1A]">
      <div className="flex items-center justify-between gap-2">
        <div className="font-comic text-xl leading-none tracking-wide text-morado">
          Nivel <span className="text-3xl text-rosa">{level}</span>
        </div>
        <div
          data-testid="time-left"
          className={`font-comic text-5xl leading-none tabular-nums ${frozen ? 'text-turquesa' : urgent ? 'animate-pulse text-rojo' : 'text-tinta'}`}
          aria-live="off"
        >
          {timeLeft.toFixed(1)}
        </div>
        <div className="text-right font-comic text-xl leading-none tracking-wide text-verde">
          <span className="text-3xl">{hits}</span>/{required}
          <div className="text-xs font-body font-extrabold tracking-normal text-tinta/70">golpes</div>
        </div>
      </div>
      <div className="mt-1 h-4 overflow-hidden rounded-full border-3 border-tinta bg-white">
        <div
          data-testid="time-bar"
          className={`h-full transition-[background-color] ${frozen ? 'bg-turquesa' : urgent ? 'bg-rojo' : 'bg-cempasuchil'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {power && (
        <div className="mt-1 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-tinta bg-cempasuchil py-0.5 pr-3 pl-1 text-xs font-extrabold">
            <PowerUpIcon id={power.id} className="h-5 w-5" />
            {power.name}
          </span>
        </div>
      )}
    </div>
  )
}
