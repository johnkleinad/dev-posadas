import { Fringe, STROKE, THIN, pts, polar } from './shared.jsx'

const CX = 150
const CY = 205
const SPIKES = 7

/** Estrella clásica de 7 picos con bandas de color y flecos en las puntas. */
export default function Estrella({ palette }) {
  const [main, second, accent, detail] = palette
  const angles = Array.from({ length: SPIKES }, (_, i) => -90 + 360 / SPIKES / 2 + (360 / SPIKES) * i)
  return (
    <g>
      {angles.map((deg, i) => {
        const tip = polar(CX, CY, 140, deg)
        const b1 = polar(CX, CY, 58, deg - 17)
        const b2 = polar(CX, CY, 58, deg + 17)
        const m1 = polar(CX, CY, 96, deg - 8.5)
        const m2 = polar(CX, CY, 96, deg + 8.5)
        const n1 = polar(CX, CY, 112, deg - 5.6)
        const n2 = polar(CX, CY, 112, deg + 5.6)
        const color = i % 2 ? second : accent
        return (
          <g key={i}>
            <polygon points={pts([b1, tip, b2])} fill={color} {...STROKE} />
            <polygon points={pts([m1, n1, n2, m2])} fill={i % 2 ? main : detail} {...THIN} />
            <polygon points={pts([b2, tip, polar(CX, CY, 58, deg + 4)])} fill="url(#halftone)" />
            <Fringe x={tip[0]} y={tip[1]} angle={deg} colors={[main, detail, second]} count={4} length={20} />
          </g>
        )
      })}
      <circle cx={CX} cy={CY} r="66" fill={main} {...STROKE} />
      <path d={`M${CX - 66},${CY} A66,66 0 0,0 ${CX + 66},${CY} Z`} fill="url(#halftone)" />
      {[0, 1, 2].map((r) => (
        <path
          key={r}
          d={`M${CX - 62},${CY - 20 + r * 20} Q${CX},${CY - 34 + r * 20} ${CX + 62},${CY - 20 + r * 20}`}
          stroke={[second, accent, detail][r]}
          strokeWidth="9"
          fill="none"
        />
      ))}
      <circle cx={CX - 24} cy={CY - 30} r="10" fill="#fff" opacity="0.8" />
    </g>
  )
}
