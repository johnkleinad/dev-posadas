const INK = '#1A1A1A'

/**
 * Palo de madera envuelto en papel de colores. El pivote (mano) está en el
 * extremo inferior: transform-origin 30px 330px dentro del viewBox 0 0 60 340.
 */
export default function Stick({ innerRef, className = '' }) {
  return (
    <svg viewBox="0 0 60 340" overflow="visible" className={className} aria-hidden="true">
      <defs>
        <clipPath id="stick-clip">
          <rect x="16" y="10" width="28" height="320" rx="14" />
        </clipPath>
      </defs>
      <g ref={innerRef} style={{ transformOrigin: '30px 330px', transformBox: 'view-box' }}>
        <rect x="16" y="10" width="28" height="320" rx="14" fill="#A8652A" />
        <g clipPath="url(#stick-clip)">
          <path d="M24,20 q4,60 -2,120 q-4,60 2,120" stroke="#7A4519" strokeWidth="3" fill="none" />
          <path d="M36,40 q-3,50 2,100 q4,50 -2,100" stroke="#7A4519" strokeWidth="2.5" fill="none" />
          <ellipse cx="32" cy="80" rx="4" ry="7" fill="#7A4519" />
          <rect x="34" y="10" width="10" height="320" fill="url(#halftone)" />
          {/* Papel enrollado en espiral (mitad inferior) */}
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M10,${200 + i * 14} L50,${188 + i * 14}`}
              stroke={['#E4007C', '#0B8A3E', '#FFC20E'][i % 3]}
              strokeWidth="9"
            />
          ))}
        </g>
        <rect x="16" y="10" width="28" height="320" rx="14" fill="none" stroke={INK} strokeWidth="5" />
        {/* Moño */}
        <path d="M30,196 l-22,-12 l2,22 Z M30,196 l22,-12 l-2,22 Z" fill="#E4007C" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="30" cy="196" r="5" fill="#FFC20E" stroke={INK} strokeWidth="3" />
      </g>
    </svg>
  )
}
