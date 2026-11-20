import Pinata from '../components/scene/Pinata.jsx'
import Stick from '../components/scene/Stick.jsx'
import PapelPicado from '../components/hud/PapelPicado.jsx'
import { PINATAS, levelTheme } from '../game/levels.js'

/** Galería solo para desarrollo (?gallery): diseños × etapas de daño. */
export default function Gallery() {
  return (
    <div className="h-full overflow-auto bg-crema p-2" style={{ userSelect: 'auto' }}>
      <PapelPicado className="h-14 w-full" />
      {PINATAS.map((kind, i) => (
        <div key={kind} className="flex items-end gap-1 border-b-2 border-tinta py-2">
          {[0, 1, 2, 3].map((d) => (
            <Pinata key={d} kind={kind} palette={levelTheme(i + 1 + (d === 3 ? 5 : 0)).palette} damage={d} className="w-1/5" />
          ))}
          <Stick className="h-24 w-8" />
        </div>
      ))}
    </div>
  )
}
