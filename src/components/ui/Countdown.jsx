import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

/** Números gigantes 3, 2, 1, ¡Dale! sobre la escena. */
export default function Countdown({ value, sfx }) {
  const ref = useRef(null)
  const label = value > 0 ? String(value) : '¡Dale!'
  useLayoutEffect(() => {
    sfx.countdown(value <= 0)
    const tw = gsap.fromTo(ref.current, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
    return () => tw.kill()
  }, [value, sfx])
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div
        ref={ref}
        className="font-comic text-[9rem] leading-none text-cempasuchil [-webkit-text-stroke:5px_#1A1A1A] [text-shadow:8px_8px_0_#E4007C]"
      >
        {label}
      </div>
    </div>
  )
}
