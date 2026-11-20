import gsap from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BACKGROUNDS } from '../../game/backgrounds.js'
import { levelTheme } from '../../game/levels.js'
import { damageStage } from '../../game/rules.js'
import Hud from '../hud/Hud.jsx'
import PapelPicado from '../hud/PapelPicado.jsx'
import Burst from './Burst.jsx'
import ImpactText from './ImpactText.jsx'
import Pinata from './Pinata.jsx'
import Stick from './Stick.jsx'

const WORDS = ['¡PUM!', '¡ZAS!', '¡PAF!', '¡TOING!', '¡POW!']
const STICK_REST = 14
const STICK_HIT = -34

/** Escena del juego: fondo, HUD, piñata, palo y entrada táctil. */
export default function GameScene({ game, sfx, children }) {
  const { state, hit, timeLeft } = game
  const { phase, level, hits, required } = state
  const theme = levelTheme(level)
  const bg = BACKGROUNDS[theme.backgroundIndex]
  const damage = phase === 'levelCleared' ? 3 : damageStage(hits, required)
  const showHud = phase !== 'menu'

  const swingRef = useRef(null) // balanceo continuo (dentro del SVG)
  const shakeRef = useRef(null) // sacudida por golpe (div contenedor)
  const stickRef = useRef(null)
  const sceneRef = useRef(null)
  const stickTween = useRef(null)
  const lastStage = useRef(0)
  const [impacts, setImpacts] = useState([])

  // Balanceo continuo de la piñata.
  useLayoutEffect(() => {
    const tw = gsap.fromTo(swingRef.current, { rotation: -5 }, { rotation: 5, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    gsap.set(stickRef.current, { rotation: STICK_REST })
    return () => tw.kill()
  }, [level])

  // Entrada de la piñata en cada nivel.
  useLayoutEffect(() => {
    lastStage.current = 0
    if (phase === 'countdown') gsap.fromTo(shakeRef.current, { y: -400 }, { y: 0, x: 0, rotation: 0, duration: 0.9, ease: 'bounce.out' })
  }, [level, phase === 'countdown']) // eslint-disable-line react-hooks/exhaustive-deps

  // Piñata rota: las mitades caen + dulces.
  useEffect(() => {
    if (phase !== 'levelCleared') return
    sfx.break()
    const root = shakeRef.current
    const tl = gsap.timeline()
    tl.to(root.querySelector('.pinata-half-left'), { x: -70, y: 260, rotation: -35, opacity: 0, duration: 1, ease: 'power2.in' }, 0)
      .to(root.querySelector('.pinata-half-right'), { x: 70, y: 260, rotation: 35, opacity: 0, duration: 1, ease: 'power2.in' }, 0)
    return () => tl.kill()
  }, [phase, sfx])

  // Tic-tac en los últimos 3 segundos.
  const secondBucket = phase === 'playing' ? Math.ceil(timeLeft) : null
  useEffect(() => {
    if (secondBucket !== null && secondBucket <= 3 && secondBucket > 0) sfx.tick()
  }, [secondBucket, sfx])

  useEffect(() => {
    if (phase === 'gameOver') sfx.lose()
  }, [phase, sfx])

  const removeImpact = useCallback((id) => setImpacts((list) => list.filter((i) => i.id !== id)), [])

  function onPointerDown(e) {
    sfx.unlock()
    if (phase !== 'playing') return
    e.preventDefault()
    if (!hit()) return

    // Palo: swing hacia la piñata y regreso.
    stickTween.current?.kill()
    stickTween.current = gsap
      .timeline()
      .to(stickRef.current, { rotation: STICK_HIT, duration: 0.06, ease: 'power3.in' })
      .to(stickRef.current, { rotation: STICK_REST, duration: 0.16, ease: 'power2.out' })

    // Piñata: sacudida y empujón.
    gsap.fromTo(
      shakeRef.current,
      { x: -18, rotation: -7 },
      { x: 0, rotation: 0, duration: 0.45, ease: 'elastic.out(1.2, 0.35)', overwrite: true },
    )

    const newStage = damageStage(hits + 1, required)
    const cracked = newStage > lastStage.current && newStage < 3
    lastStage.current = newStage
    const rect = sceneRef.current.getBoundingClientRect()
    const id = performance.now() + Math.random()
    const text = cracked ? '¡CRACK!' : WORDS[Math.floor(Math.random() * WORDS.length)]
    setImpacts((list) => [...list.slice(-5), { id, x: e.clientX - rect.left, y: e.clientY - rect.top, text, big: cracked }])
    sfx.hit()
  }

  return (
    <div
      ref={sceneRef}
      data-phase={phase}
      className="relative h-full w-full touch-none overflow-hidden select-none"
      onPointerDown={onPointerDown}
    >
      <img src={bg.src} alt="" className="absolute inset-0 h-full w-full object-cover" draggable="false" />
      <div className="absolute inset-0 bg-gradient-to-b from-rosa/45 via-naranja/20 to-morado/55 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-tinta/40" />

      <div className="relative mx-auto flex h-full max-w-[480px] flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="relative z-20 shrink-0">
          <PapelPicado className="h-12 w-full" />
          {showHud && <Hud timeLeft={timeLeft} level={level} hits={hits} required={required} />}
        </div>

        <div className="relative flex-1">
          <div ref={shakeRef} className="absolute top-[4%] left-[6%] w-[66%]" style={{ transformOrigin: '50% 0%' }}>
            <Pinata key={level} kind={theme.pinata} palette={theme.palette} damage={damage} innerRef={swingRef} className="w-full drop-shadow-[6px_8px_0_rgba(26,26,26,0.35)]" />
            {phase === 'levelCleared' && <Burst key={`burst-${level}`} />}
          </div>
          <Stick innerRef={stickRef} className="absolute right-[12%] -bottom-[3%] h-[60%] drop-shadow-[4px_6px_0_rgba(26,26,26,0.35)]" />
        </div>

        <a
          href={bg.url}
          target="_blank"
          rel="noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-1 left-2 z-10 text-[10px] text-white/80 underline-offset-2 hover:underline"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          Foto: {bg.photographer} / Unsplash
        </a>
      </div>

      {impacts.map((i) => (
        <ImpactText key={i.id} {...i} onDone={() => removeImpact(i.id)} />
      ))}
      {children}
    </div>
  )
}
