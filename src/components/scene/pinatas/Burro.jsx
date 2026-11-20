import { STROKE, THIN } from './shared.jsx'

/** Burrito de papel con flecos horizontales. */
export default function Burro({ palette }) {
  const [main, second, accent, detail] = palette
  const bands = [main, second, accent, detail, main]
  return (
    <g>
      {/* Cola */}
      <path d="M58,190 Q20,180 22,230" stroke={detail} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M58,190 Q20,180 22,230" stroke="#1A1A1A" strokeWidth="3" fill="none" />
      {/* Patas */}
      {[80, 120, 180, 220].map((x, i) => (
        <g key={x}>
          <rect x={x - 14} y="245" width="28" height="80" rx="8" fill={bands[i + 1]} {...STROKE} />
          <rect x={x - 16} y="312" width="32" height="20" rx="5" fill="#1A1A1A" />
        </g>
      ))}
      {/* Cuerpo */}
      <rect x="50" y="150" width="200" height="115" rx="50" fill={main} {...STROKE} />
      <clipPath id="burro-body">
        <rect x="50" y="150" width="200" height="115" rx="50" />
      </clipPath>
      <g clipPath="url(#burro-body)">
        {bands.map((c, i) => (
          <path key={i} d={`M40,${165 + i * 22} q20,8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0`} stroke={c} strokeWidth="14" fill="none" />
        ))}
        <rect x="50" y="225" width="200" height="40" fill="url(#halftone)" />
      </g>
      <rect x="50" y="150" width="200" height="115" rx="50" fill="none" {...STROKE} />
      {/* Cuello y cabeza */}
      <path d="M200,175 L222,98 L262,108 L248,185 Z" fill={second} {...STROKE} />
      <polygon points="214,84 222,32 240,82" fill={accent} {...STROKE} />
      <polygon points="244,88 266,40 266,96" fill={detail} {...STROKE} />
      <rect x="208" y="78" width="78" height="56" rx="26" fill={second} {...STROKE} />
      <ellipse cx="276" cy="112" rx="18" ry="16" fill="#F7D9B0" {...THIN} />
      <circle cx="272" cy="108" r="3" fill="#1A1A1A" />
      <circle cx="282" cy="114" r="3" fill="#1A1A1A" />
      <circle cx="238" cy="98" r="9" fill="#fff" {...THIN} />
      <circle cx="241" cy="99" r="4.5" fill="#1A1A1A" />
      {/* Crin de flecos */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${212 + i * 4},${92 + i * 16} l-18,-4`} stroke={[main, accent, detail][i % 3]} strokeWidth="8" strokeLinecap="round" />
      ))}
    </g>
  )
}
