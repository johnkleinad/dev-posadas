import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'

/** Tarjeta modal estilo cómic. Bloquea los taps hacia la escena. */
export default function Modal({ title, children, delay = 0, labelledBy = 'modal-title' }) {
  const backdrop = useRef(null)
  const card = useRef(null)
  // Los botones no responden hasta que la tarjeta es visible (evita taps a ciegas).
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => {
    const tl = gsap.timeline({ delay, onComplete: () => setReady(true) })
    tl.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.2 }).fromTo(
      card.current,
      { scale: 0.6, rotation: -4, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' },
      0,
    )
    return () => tl.kill()
  }, [delay])
  return (
    <div
      ref={backdrop}
      className="absolute inset-0 z-40 flex items-center justify-center bg-tinta/45 p-4 opacity-0"
      onPointerDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        ref={card}
        data-testid="modal-card"
        style={{ pointerEvents: ready ? 'auto' : 'none' }}
        className="max-h-[92%] w-full max-w-[420px] overflow-y-auto rounded-3xl border-4 border-tinta bg-crema p-5 shadow-[8px_8px_0_#1A1A1A]"
      >
        {title && (
          <h2 id={labelledBy} className="text-center font-comic text-4xl leading-none tracking-wide text-rosa [text-shadow:2px_2px_0_#1A1A1A]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

/** Botón grande de cómic. */
export function ComicButton({ children, color = 'bg-cempasuchil', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`w-full rounded-2xl border-4 border-tinta px-5 py-2 font-comic text-3xl tracking-wide text-tinta shadow-[4px_4px_0_#1A1A1A] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#1A1A1A] disabled:opacity-60 ${color} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
