import { Fringe, STROKE, THIN, pts, polar } from './shared.jsx'

const CX = 150
const CY = 210
const GOLD = '#FFC20E'

/** Estrella dorada de 5 puntas con cara sonriente y flecos largos. */
export default function EstrellaDorada({ palette }) {
  const [main, second, accent, detail] = palette
  const star = Array.from({ length: 10 }, (_, i) => polar(CX, CY, i % 2 ? 62 : 138, -90 + i * 36))
  const inner = Array.from({ length: 10 }, (_, i) => polar(CX, CY, i % 2 ? 40 : 96, -90 + i * 36))
  return (
    <g>
      {star
        .filter((_, i) => i % 2 === 0)
        .map(([x, y], i) => (
          <Fringe key={i} x={x} y={y} angle={-90 + i * 72} colors={[main, second, accent, detail]} count={6} length={34} spread={40} />
        ))}
      <polygon points={pts(star)} fill={GOLD} {...STROKE} />
      <polygon points={pts(inner)} fill="#FFE07A" {...THIN} />
      <polygon points={pts([star[0], star[1], [CX, CY], star[9]])} fill="url(#halftone)" opacity="0.6" />
      <polygon points={pts([[CX, CY], star[3], star[4], star[5]])} fill="url(#halftone)" />
      {/* Cara */}
      <ellipse cx={CX - 22} cy={CY - 6} rx="10" ry="14" fill="#fff" {...THIN} />
      <ellipse cx={CX + 22} cy={CY - 6} rx="10" ry="14" fill="#fff" {...THIN} />
      <circle cx={CX - 20} cy={CY - 3} r="5" fill="#1A1A1A" />
      <circle cx={CX + 24} cy={CY - 3} r="5" fill="#1A1A1A" />
      <path d={`M${CX - 26},${CY + 18} Q${CX},${CY + 44} ${CX + 26},${CY + 18}`} fill={main} {...THIN} />
      <circle cx={CX - 40} cy={CY + 14} r="8" fill={main} opacity="0.5" />
      <circle cx={CX + 40} cy={CY + 14} r="8" fill={main} opacity="0.5" />
    </g>
  )
}
