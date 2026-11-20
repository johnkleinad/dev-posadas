// Utilidades compartidas por los diseños de piñata (viewBox 0 0 300 360, cuelgue en 150,0).
export const INK = '#1A1A1A'
export const STROKE = { stroke: INK, strokeWidth: 6, strokeLinejoin: 'round', strokeLinecap: 'round' }
export const THIN = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round', strokeLinecap: 'round' }

export const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
export const pts = (list) => list.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')

/** Trama de puntos estilo cómic para sombras. */
export function HalftoneDefs() {
  return (
    <defs>
      <pattern id="halftone" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="4.5" cy="4.5" r="2.1" fill={INK} opacity="0.35" />
      </pattern>
      <clipPath id="half-left">
        <polygon points="0,0 160,0 135,120 165,220 140,360 0,360" />
      </clipPath>
      <clipPath id="half-right">
        <polygon points="160,0 300,0 300,360 140,360 165,220 135,120" />
      </clipPath>
    </defs>
  )
}

/** Cuerda que sube hasta el punto de cuelgue. */
export function Rope({ to = 120 }) {
  return (
    <g>
      <path d={`M150,-400 L150,${to}`} stroke={INK} strokeWidth="7" />
      <path d={`M150,-400 L150,${to}`} stroke="#E8C48A" strokeWidth="3" strokeDasharray="6 5" />
    </g>
  )
}

/** Flecos de papel de china: tiras que cuelgan desde (x, y). */
export function Fringe({ x, y, colors, count = 5, length = 26, spread = 22, angle = 90 }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread
        const [ex, ey] = polar(x, y, length + (i % 2) * 6, angle + offset)
        return (
          <path
            key={i}
            d={`M${x},${y} Q${(x + ex) / 2 + 4},${(y + ey) / 2} ${ex},${ey}`}
            stroke={colors[i % colors.length]}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}
