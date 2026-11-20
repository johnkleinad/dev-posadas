import { Fringe, STROKE, THIN, pts, polar } from './shared.jsx'

const CLAY = '#C1652F'

/** Piñata de olla de barro con corona de papel y picos cortos. */
export default function Olla({ palette }) {
  const [main, second, accent, detail] = palette
  const spikes = [-150, -110, -70, -30]
  return (
    <g>
      {spikes.map((deg, i) => {
        const tip = polar(150, 215, 145, deg)
        return (
          <g key={deg}>
            <polygon points={pts([polar(150, 215, 70, deg - 14), tip, polar(150, 215, 70, deg + 14)])} fill={[main, accent, second, detail][i]} {...STROKE} />
            <Fringe x={tip[0]} y={tip[1]} angle={deg} colors={[second, main, detail]} count={3} length={18} />
          </g>
        )
      })}
      {/* Corona de papel arrugado */}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={78 + i * 18} cy={148 + (i % 2) * 6} r="16" fill={[main, second, accent][i % 3]} {...THIN} />
      ))}
      {/* Olla */}
      <path d="M70,160 Q40,240 92,300 Q150,340 208,300 Q260,240 230,160 Z" fill={CLAY} {...STROKE} />
      <path d="M150,330 Q208,315 230,250 Q245,200 230,160 L200,160 Q215,250 150,330 Z" fill="url(#halftone)" />
      {/* Bandas pintadas */}
      <path d="M58,205 Q150,228 242,205" stroke="#FFF6E5" strokeWidth="14" fill="none" />
      <path d="M58,205 Q150,228 242,205" stroke={main} strokeWidth="5" strokeDasharray="12 10" fill="none" />
      {[90, 120, 150, 180, 210].map((x) => (
        <g key={x}>
          <circle cx={x} cy="262" r="10" fill={second} {...THIN} />
          <circle cx={x} cy="262" r="3.5" fill={detail} />
        </g>
      ))}
      <path d="M82,290 Q150,316 218,290" stroke={accent} strokeWidth="6" fill="none" />
      <ellipse cx="150" cy="160" rx="82" ry="14" fill={CLAY} {...STROKE} />
      <ellipse cx="150" cy="160" rx="66" ry="8" fill="#5A2A10" />
    </g>
  )
}
