const INK = '#1A1A1A'
const S = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }

/** Íconos de cómic de los power-ups (viewBox 40×40). */
const ICONS = {
  velita: (
    <>
      <rect x="15" y="16" width="10" height="19" rx="2" fill="#FFF7E8" {...S} />
      <path d="M20 16v-3" {...S} />
      <path d="M20 4c4 4 4 8 0 9c-4-1-4-5 0-9z" fill="#FF7A00" {...S} />
      <path d="M15 22h10" stroke="#E4007C" strokeWidth="3" />
    </>
  ),
  escarcha: (
    <g {...S} stroke="#00A6A6" strokeWidth="3.5">
      <path d="M20 5v30M7 12.5l26 15M7 27.5l26-15" />
      <path d="M16 7l4 4 4-4M16 33l4-4 4 4" fill="none" />
    </g>
  ),
  tamarindo: (
    <>
      <path d="M5 20l7-6v12zM35 20l-7-6v12z" fill="#D7263D" {...S} />
      <ellipse cx="20" cy="20" rx="10" ry="8" fill="#8B4A1C" {...S} />
      <path d="M14 17q3 -2 5 0" stroke="#FFC20E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),
  bengala: (
    <>
      <path d="M12 34l12-16" stroke="#7A4519" strokeWidth="3" strokeLinecap="round" />
      <circle cx="26" cy="15" r="5" fill="#FFC20E" {...S} />
      <path d="M26 4v4M35 8l-3 3M37 16h-4M17 8l3 3M30 24l-2-3" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  ponche: (
    <>
      <path d="M9 14h22l-3 18a4 4 0 0 1-4 3h-8a4 4 0 0 1-4-3z" fill="#D7263D" {...S} />
      <path d="M31 18h3a3 3 0 0 1 0 8h-4" fill="none" {...S} />
      <circle cx="17" cy="21" r="2.5" fill="#FF7A00" stroke={INK} strokeWidth="1.5" />
      <path d="M15 10q2-3 0-6M22 10q2-3 0-6" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  posada: (
    <>
      <path d="M8 18l12-10 12 10v16H8z" fill="#FF7A00" {...S} />
      <rect x="16" y="22" width="8" height="12" fill="#6A2C91" {...S} />
      <circle cx="22" cy="28" r="1" fill="#FFC20E" />
    </>
  ),
}

export default function PowerUpIcon({ id, className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {ICONS[id] ?? null}
    </svg>
  )
}
