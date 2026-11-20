import Cracks from './Cracks.jsx'
import { DESIGNS, ROPE_END } from './pinatas/index.js'
import { HalftoneDefs, Rope } from './pinatas/shared.jsx'

/**
 * Piñata colgando de su cuerda. `innerRef` apunta al <g> que GSAP balancea
 * (pivote en el punto de cuelgue 150,0). Con daño 3 se parte en dos mitades
 * (.pinata-half-left / .pinata-half-right) para animarlas cayendo.
 */
export default function Pinata({ kind, palette, damage = 0, innerRef, className = '' }) {
  const Design = DESIGNS[kind] ?? DESIGNS.estrella
  const body = (
    <>
      <Design palette={palette} />
      <Cracks stage={damage} />
    </>
  )
  return (
    <svg viewBox="0 -40 300 400" overflow="visible" className={className} aria-label="Piñata" role="img">
      <HalftoneDefs />
      <g ref={innerRef} style={{ transformOrigin: '150px -40px', transformBox: 'view-box' }}>
        <Rope to={ROPE_END[kind] ?? 140} />
        {damage >= 3 ? (
          <>
            <g className="pinata-half-left" clipPath="url(#half-left)">{body}</g>
            <g className="pinata-half-right" clipPath="url(#half-right)">{body}</g>
          </>
        ) : (
          body
        )}
      </g>
    </svg>
  )
}
