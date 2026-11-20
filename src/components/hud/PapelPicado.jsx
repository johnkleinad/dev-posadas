const COLORS = ['#E4007C', '#FF7A00', '#FFC20E', '#0B8A3E', '#00A6A6', '#6A2C91', '#D7263D']
const FLAG_W = 56
const COUNT = 32

/** Una bandera de papel picado con calados (fill-rule evenodd). */
function flagPath(x) {
  const outer = `M${x + 4},6 h${FLAG_W - 8} v46 l-7,8 l-7,-8 l-7,8 l-7,-8 l-7,8 l-7,-8 l-6,8 v-54 Z`
  const c = x + FLAG_W / 2
  const holes = [
    `M${c},16 l7,8 l-7,8 l-7,-8 Z`,
    `M${c - 16},14 h6 v6 h-6 Z`,
    `M${c + 10},14 h6 v6 h-6 Z`,
    `M${c - 14},36 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0 Z`,
    `M${c + 6},36 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0 Z`,
    `M${c - 3},40 h6 v6 h-6 Z`,
  ]
  return [outer, ...holes].join(' ')
}

/** Banda decorativa de papel picado para la parte superior. */
export default function PapelPicado({ className = '', style }) {
  const width = FLAG_W * COUNT
  return (
    <svg viewBox={`0 0 ${width} 66`} preserveAspectRatio="xMidYMin slice" className={className} style={style} aria-hidden="true">
      <path d={`M0,6 Q${width / 2},14 ${width},6`} stroke="#1A1A1A" strokeWidth="3" fill="none" />
      {Array.from({ length: COUNT }, (_, i) => (
        <path
          key={i}
          d={flagPath(i * FLAG_W)}
          fill={COLORS[i % COLORS.length]}
          fillRule="evenodd"
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          transform={`rotate(${(i % 2 ? 2 : -2)} ${i * FLAG_W + FLAG_W / 2} 6)`}
        />
      ))}
    </svg>
  )
}
