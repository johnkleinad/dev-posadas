import { lazy, Suspense, useMemo } from 'react'
import { createSfx } from './audio/sfx.js'
import GameScene from './components/scene/GameScene.jsx'
import { useGame } from './game/useGame.js'

const Gallery = import.meta.env.DEV ? lazy(() => import('./dev/Gallery.jsx')) : null
const showGallery = Gallery && new URLSearchParams(location.search).has('gallery')

function Game() {
  const game = useGame()
  const sfx = useMemo(() => createSfx(), [])
  const { phase } = game.state
  return (
    <GameScene game={game} sfx={sfx}>
      {phase !== 'playing' && phase !== 'countdown' && (
        <button
          className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 rounded-xl border-4 border-tinta bg-cempasuchil px-6 py-2 font-comic text-3xl"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={phase === 'levelCleared' ? game.nextLevel : game.start}
        >
          {phase === 'levelCleared' ? 'Siguiente' : 'Empezar'}
        </button>
      )}
    </GameScene>
  )
}

export default function App() {
  if (showGallery) {
    return (
      <Suspense fallback={null}>
        <Gallery />
      </Suspense>
    )
  }
  return <Game />
}
