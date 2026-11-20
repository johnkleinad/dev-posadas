const MEDALS = ['bg-cempasuchil', 'bg-[#C9D1D9]', 'bg-[#E0915A]']

/** Tabla de puntajes: top 10 ordenado por nivel y luego puntos. */
export default function Leaderboard({ scores, status, onRetry, highlightId, limit = 10 }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-center font-comic text-2xl tracking-wide text-morado">Tabla de campeones</h3>
      {status === 'loading' && <p className="text-center text-sm font-extrabold text-tinta/60">Cargando…</p>}
      {status === 'error' && (
        <div className="text-center text-sm font-extrabold text-rojo">
          No se pudo cargar la tabla.{' '}
          <button type="button" className="underline" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}
      {status === 'ok' && scores.length === 0 && (
        <p className="text-center text-sm font-extrabold text-tinta/60">¡Nadie ha jugado todavía! Sé el primero.</p>
      )}
      {status === 'ok' && scores.length > 0 && (
        <ol className="overflow-hidden rounded-xl border-3 border-tinta bg-white">
          {scores.slice(0, limit).map((s, i) => (
            <li
              key={s.id ?? i}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-extrabold odd:bg-cempasuchil/15 ${
                s.id === highlightId ? 'bg-rosa! text-white' : ''
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-comic text-base text-tinta ${
                  MEDALS[i] ? `${MEDALS[i]} border-2 border-tinta` : ''
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <span className="font-comic text-base tracking-wide">Nv {s.level}</span>
              <span className="w-14 text-right tabular-nums">{s.points}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
