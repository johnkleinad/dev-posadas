import { lazy, Suspense } from 'react'

const Gallery = import.meta.env.DEV ? lazy(() => import('./dev/Gallery.jsx')) : null
const showGallery = Gallery && new URLSearchParams(location.search).has('gallery')

export default function App() {
  if (showGallery) {
    return (
      <Suspense fallback={null}>
        <Gallery />
      </Suspense>
    )
  }
  return (
    <div className="grid h-full place-items-center">
      <h1 className="font-comic text-6xl text-rosa">¡Dale, Dale!</h1>
    </div>
  )
}
