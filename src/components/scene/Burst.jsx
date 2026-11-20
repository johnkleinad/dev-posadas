import gsap from 'gsap'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import { useLayoutEffect, useMemo, useRef } from 'react'

gsap.registerPlugin(Physics2DPlugin)

const COLORS = ['#E4007C', '#FF7A00', '#FFC20E', '#0B8A3E', '#00A6A6', '#6A2C91', '#D7263D']
const COUNT = 42

function Candy({ kind, color }) {
  if (kind === 0)
    return (
      <svg width="34" height="18" viewBox="0 0 34 18">
        <path d="M2,2 L10,9 L2,16 Z M32,2 L24,9 L32,16 Z" fill={color} stroke="#1A1A1A" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="17" cy="9" rx="8" ry="7" fill={color} stroke="#1A1A1A" strokeWidth="2" />
        <path d="M13,5 l8,8" stroke="#fff" strokeWidth="2" />
      </svg>
    )
  if (kind === 1)
    return (
      <svg width="16" height="24" viewBox="0 0 16 24">
        <path d="M8,2 C2,2 2,10 5,12 C2,14 2,22 8,22 C14,22 14,14 11,12 C14,10 14,2 8,2 Z" fill="#D9A066" stroke="#1A1A1A" strokeWidth="2" />
      </svg>
    )
  if (kind === 2)
    return (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill={color} stroke="#1A1A1A" strokeWidth="2" />
        <path d="M10,2 v16 M2,10 h16" stroke="#fff" strokeWidth="2" />
      </svg>
    )
  return <div className="h-3 w-2" style={{ background: color }} />
}

/** Explosión de dulces y confeti desde el centro del contenedor. */
export default function Burst({ onDone }) {
  const ref = useRef(null)
  const pieces = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({ kind: i % 5 === 4 ? 3 : i % 4, color: COLORS[i % COLORS.length] })),
    [],
  )
  useLayoutEffect(() => {
    const els = ref.current.children
    const tl = gsap.timeline({ onComplete: onDone })
    tl.to(els, {
      duration: 1.6,
      physics2D: {
        velocity: () => gsap.utils.random(350, 750),
        angle: () => gsap.utils.random(200, 340),
        gravity: 900,
      },
      rotation: () => gsap.utils.random(-540, 540),
      ease: 'none',
    }).to(els, { opacity: 0, duration: 0.4 }, 1.2)
    return () => tl.kill()
  }, [onDone])
  return (
    <div ref={ref} className="pointer-events-none absolute top-1/2 left-1/2 z-10">
      {pieces.map((p, i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2">
          <Candy {...p} />
        </div>
      ))}
    </div>
  )
}
