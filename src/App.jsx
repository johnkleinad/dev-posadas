import { lazy, Suspense, useMemo, useState } from 'react'
import { createSfx } from './audio/sfx.js'
import GameScene from './components/scene/GameScene.jsx'
import Countdown from './components/ui/Countdown.jsx'
import GameOverModal from './components/ui/GameOverModal.jsx'
import LevelClearedModal from './components/ui/LevelClearedModal.jsx'
import ModeModal from './components/ui/ModeModal.jsx'
import ModeSelectModal from './components/ui/ModeSelectModal.jsx'
import { getMode } from './game/modes.js'
import { useGame } from './game/useGame.js'
import { useLeaderboard } from './game/useLeaderboard.js'
import { scoresApi } from './scores/scoresApi.js'

const Gallery = import.meta.env.DEV ? lazy(() => import('./dev/Gallery.jsx')) : null
const showGallery = Gallery && new URLSearchParams(location.search).has('gallery')

const MUTE_KEY = 'pinatas-muted'
const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function Game() {
  const game = useGame()
  const { state } = game
  const { phase } = state
  const [muted, setMuted] = useState(readMuted)
  const sfx = useMemo(() => {
    const s = createSfx()
    s.setMuted(readMuted())
    return s
  }, [])
  // Menú en dos pantallas: selección de modo → pantalla del modo (reglas, tabla y ¡Jugar!).
  const [screen, setScreen] = useState('modes') // 'modes' | 'mode'
  const [selectedModeId, setSelectedModeId] = useState('clasico')
  const mode = getMode(phase === 'menu' ? selectedModeId : state.modeId)
  const boardActive = (phase === 'menu' && screen === 'mode') || phase === 'gameOver'
  const { board, submit } = useLeaderboard(scoresApi, boardActive, mode.boardId)

  function toggleMute() {
    const next = !muted
    setMuted(next)
    sfx.setMuted(next)
    if (!next) sfx.unlock()
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      /* sin almacenamiento */
    }
  }

  /** Empieza `modeId`; sin argumento repite el modo de la partida actual ("Otra vez"). */
  function play(modeId) {
    sfx.unlock()
    game.start(modeId)
  }

  function pickMode(modeId) {
    sfx.unlock()
    setSelectedModeId(modeId)
    setScreen('mode')
  }

  function backToMode() {
    setSelectedModeId(state.modeId)
    setScreen('mode')
    game.toMenu()
  }

  return (
    <GameScene game={game} sfx={sfx}>
      {phase === 'menu' && screen === 'modes' && <ModeSelectModal onPick={pickMode} muted={muted} onToggleMute={toggleMute} />}
      {phase === 'menu' && screen === 'mode' && (
        <ModeModal mode={mode} board={board} onPlay={() => play(mode.id)} onBack={() => setScreen('modes')} />
      )}
      {phase === 'countdown' && <Countdown value={game.countdownLeft} sfx={sfx} />}
      {phase === 'playing' && game.timeLeft > 9.4 && <Countdown value={0} sfx={sfx} />}
      {phase === 'levelCleared' && <LevelClearedModal key={state.level} state={state} onNext={game.nextLevel} />}
      {phase === 'gameOver' && <GameOverModal state={state} board={board} onSave={submit} onRestart={() => play()} onMenu={backToMode} />}
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
