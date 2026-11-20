import { LEVEL_SECONDS } from '../../game/rules.js'

/** Barra superior: tiempo restante (número + barra), nivel y golpes. */
export default function Hud({ timeLeft, level, hits, required }) {
  const pct = Math.max(0, Math.min(1, timeLeft / LEVEL_SECONDS)) * 100
  const urgent = timeLeft <= 3 && timeLeft > 0
  return (
    <div className="mx-3 rounded-2xl border-4 border-tinta bg-crema px-3 pt-1 pb-2 shadow-[5px_5px_0_#1A1A1A]">
      <div className="flex items-center justify-between gap-2">
        <div className="font-comic text-xl leading-none tracking-wide text-morado">
          Nivel <span className="text-3xl text-rosa">{level}</span>
        </div>
        <div
          data-testid="time-left"
          className={`font-comic text-5xl leading-none tabular-nums ${urgent ? 'animate-pulse text-rojo' : 'text-tinta'}`}
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
          className={`h-full transition-[background-color] ${urgent ? 'bg-rojo' : 'bg-cempasuchil'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
