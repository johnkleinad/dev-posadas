import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

const COLORS = ['#FFC20E', '#E4007C', '#00A6A6', '#FF7A00']

/** Onomatopeya de cómic que aparece donde se tocó y se desvanece. */
export default function ImpactText({ x, y, text, big = false, onDone }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const tl = gsap.timeline({ onComplete: onDone })
    tl.fromTo(ref.current, { scale: 0, rotation: gsap.utils.random(-25, 25) }, { scale: big ? 1.5 : 1.15, duration: 0.12, ease: 'back.out(3)' })
      .to(ref.current, { y: -40, opacity: 0, duration: 0.4, ease: 'power1.in' }, 0.15)
    return () => tl.kill()
  }, [big, onDone])
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 font-comic text-4xl whitespace-nowrap"
      style={{
        left: x,
        top: y,
        color: COLORS[text.length % COLORS.length],
        WebkitTextStroke: '2px #1A1A1A',
        textShadow: '3px 3px 0 #1A1A1A',
      }}
    >
      {text}
    </div>
  )
}
