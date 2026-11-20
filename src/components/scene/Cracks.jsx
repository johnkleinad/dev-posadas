import { INK } from './pinatas/shared.jsx'

const crack = (d, w = 4) => <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />

/** Capas de daño sobre la piñata: 1 grietas, 2 grietas + huecos, 3 todo. */
export default function Cracks({ stage }) {
  if (stage < 1) return null
  return (
    <g pointerEvents="none">
      {crack('M120,170 l14,16 l-10,12 l18,18 l-6,14')}
      {crack('M190,240 l-12,10 l8,14 l-14,10')}
      {crack('M168,150 l6,14 l-8,8', 3)}
      {stage >= 2 && (
        <>
          <polygon points="132,212 150,204 162,222 150,236 136,230" fill="#2A160A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="196,190 210,184 214,200 202,206" fill="#2A160A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          {crack('M100,250 l16,-6 l6,16 l16,-4 l4,14')}
          {crack('M210,150 l-10,14 l12,10 l-8,16')}
          {crack('M150,236 l-6,22 l10,14', 3.5)}
        </>
      )}
      {stage >= 3 && crack('M160,0 L135,120 L165,220 L140,360', 6)}
    </g>
  )
}
