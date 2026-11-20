# ¡Dale, Dale! — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Juego web de piñatas por niveles (10 s por nivel, más golpes cada vez), estilo cómic con colores de posada, tabla de puntajes en Amplify Gen2, publicado en Amplify Hosting.

**Architecture:** Lógica pura en `src/game/` (reglas, ranking, validación, limitador, reducer de estados) probada con Vitest. Escena React con SVG animado por GSAP (piñata, palo, partículas) sobre una foto de fondo local. Menús como modales. Backend Amplify Gen2 con un modelo `Score` y acceso por API key. Despliegue con CI de Amplify Hosting desde GitHub.

**Tech Stack:** Vite 8, React 19 (JSX), Tailwind 4 (`@tailwindcss/vite`), GSAP 3, Vitest, Amplify Gen2 (`@aws-amplify/backend`, `aws-amplify`), Fontsource (Bangers, Nunito), Playwright (preinstalado) para la prueba de humo.

**Spec:** `docs/superpowers/specs/2026-11-20-pinatas-posadas-design.md`

## Global Constraints

- Frontend en JavaScript/JSX (como el proyecto); el backend de Amplify en TypeScript (`amplify/`).
- Toda la interfaz en español.
- `LEVEL_SECONDS = 10`; `hitsRequired(n) = 15 + 6·(n−1)`; `levelPoints(n, s) = 100·n + round(s·50)`.
- Ranking: `level` desc, luego `points` desc, luego `createdAt` asc (el primero en lograrlo gana el empate exacto).
- Nombre: 1–20 caracteres después de recortar espacios.
- Limitador: máximo 20 golpes por cada ventana móvil de 1000 ms.
- Paleta: `#E4007C` rosa, `#FF7A00` naranja, `#FFC20E` cempasúchil, `#0B8A3E` verde, `#D7263D` rojo, `#6A2C91` morado, `#00A6A6` turquesa, `#1A1A1A` tinta.
- Perfil AWS `student-cd`, región `us-east-1`. Todo comando `ampx`/`aws` lleva `--profile student-cd` (o `AWS_PROFILE=student-cd`) y `--once` en sandbox.
- Las imágenes de fondo y las fuentes se sirven desde el propio sitio (nada de CDN en tiempo de juego).
- Nada de modelos de IA ni secretos en el repo; `amplify_outputs.json` y `.amplify/` en `.gitignore`.

## Review Focus

1. **Taps durante la cuenta regresiva o con un modal abierto** no deben contar ni "guardarse" para el siguiente nivel → prueba en Task 3 (`HIT` ignorado fuera de `playing`).
2. **Último golpe justo al vencer el tiempo:** un golpe con `now < deadline` cuenta y rompe; con `now >= deadline` no → prueba en Task 3.
3. **Tabla de puntajes caída** (sin red, API key vencida): el juego sigue jugable, el modal muestra "No se pudo cargar" con reintentar → prueba en Task 4 (`fetchTopScores` devuelve `{ ok:false }` sin lanzar); API key con `expiresInDays: 365`.
4. **Doble tap en "Guardar"** no crea dos registros → Task 8 (botón deshabilitado mientras `saving`; verificado en la prueba de humo).
5. **Celular bloqueado o pestaña oculta a mitad de nivel:** el tiempo se basa en marcas de tiempo, así que al volver el `TICK` termina el nivel correctamente (no se congela ni da tiempo extra) → prueba en Task 3.

---

## File Structure

```
amplify/backend.ts                 defineBackend({ data })
amplify/data/resource.ts           modelo Score + auth apiKey
amplify.yml                        build de Amplify Hosting
index.html                         lang="es", título, viewport sin zoom
vite.config.js                     + tailwindcss(), + bloque test de Vitest
public/backgrounds/bg-1..5.webp    fotos de Unsplash optimizadas
src/main.jsx                       Amplify.configure(outputs)
src/index.css                      @import tailwind, @theme (paleta, fuentes), reglas táctiles
src/App.jsx                        une escena + modales + hook del juego
src/game/rules.js                  constantes y fórmulas
src/game/ranking.js                ordenar y top N
src/game/validation.js             sanitizeName
src/game/hitLimiter.js             limitador de golpes
src/game/levels.js                 tema por nivel (piñata, paleta, fondo)
src/game/backgrounds.js            lista de fondos + créditos
src/game/gameReducer.js            máquina de estados pura
src/game/useGame.js                hook: reducer + reloj rAF + limitador
src/scores/scoresApi.js            fetchTopScores / submitScore
src/audio/sfx.js                   efectos Web Audio
src/components/scene/GameScene.jsx fondo, velo, piñata, palo, input
src/components/scene/Stick.jsx     palo SVG + swing GSAP
src/components/scene/Pinata.jsx    elige diseño, balanceo y sacudida
src/components/scene/pinatas/{Estrella,Burro,EstrellaDorada,Olla,Santa}.jsx
src/components/scene/Cracks.jsx    capas de daño
src/components/scene/Burst.jsx     dulces + confeti
src/components/scene/ImpactText.jsx  "¡PUM!" etc.
src/components/hud/Hud.jsx         tiempo (número + barra), nivel, golpes
src/components/hud/PapelPicado.jsx banda decorativa
src/components/ui/Modal.jsx        contenedor de modal
src/components/ui/{StartModal,Countdown,LevelClearedModal,GameOverModal,Leaderboard}.jsx
src/**/*.test.js                   pruebas de Vitest junto a cada módulo
scripts/smoke.mjs                  prueba de humo con Playwright (móvil)
```

Se borran `src/App.css`, `src/assets/*` y el contenido de plantilla de `App.jsx`.

---

### Task 1: Base del proyecto y reglas del juego

**Files:**
- Modify: `vite.config.js`, `package.json`, `index.html`, `src/index.css`, `src/App.jsx`, `.gitignore`
- Delete: `src/App.css`, `src/assets/`
- Create: `src/game/rules.js`, `src/game/rules.test.js`

**Interfaces:**
- Produces: `LEVEL_SECONDS = 10`, `COUNTDOWN_SECONDS = 3`, `hitsRequired(level: number) => number`, `levelPoints(level: number, secondsLeft: number) => number`, `damageStage(hits: number, required: number) => 0|1|2|3`.

- [ ] **Step 1:** `git init`, rama `main`. Agregar a `.gitignore`: `amplify_outputs.json`, `.amplify/`, `.env*`.
- [ ] **Step 2:** `npm i gsap @fontsource/bangers @fontsource/nunito aws-amplify` y `npm i -D @tailwindcss/vite vitest`. Quitar `autoprefixer` y `postcss` (no se usan con Tailwind 4 + Vite). Script `"test": "vitest run"`.
- [ ] **Step 3:** `vite.config.js`: agregar `tailwindcss()` a `plugins` y `test: { environment: 'node' }`. `src/index.css`: `@import "tailwindcss";` y un bloque `@theme` con `--color-rosa`, `--color-naranja`, `--color-cempasuchil`, `--color-verde`, `--color-rojo`, `--color-morado`, `--color-turquesa`, `--color-tinta` (valores de las restricciones globales), `--font-comic: "Bangers"` y `--font-body: "Nunito"`. Importar las fuentes de Fontsource en `main.jsx`. `html, body, #root` a 100% de alto, sin scroll, `overscroll-behavior: none`. `index.html`: `lang="es"`, `<title>¡Dale, Dale! Piñatas</title>`, viewport `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`, `theme-color` `#E4007C`.
- [ ] **Step 4: Escribir las pruebas que fallan** en `src/game/rules.test.js`:

```js
expect(hitsRequired(1)).toBe(15); expect(hitsRequired(5)).toBe(39); expect(hitsRequired(10)).toBe(69)
expect(levelPoints(1, 0)).toBe(100); expect(levelPoints(3, 4.26)).toBe(513) // 300 + round(213)
expect(levelPoints(2, -1)).toBe(200) // segundos negativos se tratan como 0
expect(damageStage(0, 15)).toBe(0); expect(damageStage(5, 15)).toBe(1)
expect(damageStage(10, 15)).toBe(2); expect(damageStage(15, 15)).toBe(3)
```
  `damageStage`: 0 si `hits/required < 1/3`, 1 si `< 2/3`, 2 si `< 1`, 3 si `>= 1`.
- [ ] **Step 5:** `npm test` → FAIL (módulo inexistente).
- [ ] **Step 6:** Implementar `src/game/rules.js`.
- [ ] **Step 7:** `npm test` → PASS. `npm run build` → sin errores. `App.jsx` temporal que solo dice "¡Dale, Dale!" en `font-comic text-rosa` (comprueba que Tailwind y las fuentes ya aplican).
- [ ] **Step 8:** Commit `chore: base con tailwind, gsap, vitest y reglas del juego`.

### Task 2: Ranking, validación de nombre y limitador de golpes

**Files:**
- Create: `src/game/ranking.js`, `src/game/validation.js`, `src/game/hitLimiter.js` y sus `.test.js`

**Interfaces:**
- Produces:
  - `rankScores(scores: {name, level, points, createdAt}[]) => same[]` (sin mutar la entrada; criterio de las restricciones globales) y `topScores(scores, n = 10)`.
  - `sanitizeName(raw: string) => string | null` (recorta, colapsa espacios internos, elimina caracteres de control; `null` si queda vacío; corta a 20 caracteres por grafema con `Array.from`).
  - `createHitLimiter({ max = 20, windowMs = 1000 } = {}) => (nowMs: number) => boolean` (true si el golpe se acepta).

- [ ] **Step 1: Pruebas que fallan:**

```js
// ranking
const s = [
  { name:'A', level:3, points:500, createdAt:'2026-11-20T10:00:00Z' },
  { name:'B', level:5, points:100, createdAt:'2026-11-20T10:00:00Z' },
  { name:'C', level:3, points:900, createdAt:'2026-11-20T10:00:00Z' },
  { name:'D', level:3, points:900, createdAt:'2026-11-20T09:00:00Z' },
]
expect(rankScores(s).map(x=>x.name)).toEqual(['B','D','C','A'])
expect(topScores(s, 2).map(x=>x.name)).toEqual(['B','D'])
expect(s[0].name).toBe('A') // no muta
// validation
expect(sanitizeName('   ')).toBeNull()
expect(sanitizeName('  Juan   Pérez ')).toBe('Juan Pérez')
expect(sanitizeName('a'.repeat(30))).toHaveLength(20)
expect(Array.from(sanitizeName('🎉'.repeat(25)))).toHaveLength(20)
// limiter
const ok = createHitLimiter()
const results = Array.from({length:25}, (_,i)=>ok(i*10)) // 25 golpes en 250 ms
expect(results.filter(Boolean)).toHaveLength(20)
expect(ok(1300)).toBe(true) // la ventana ya avanzó
```
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar los tres módulos (el limitador guarda los timestamps aceptados y descarta los anteriores a `now - windowMs`).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: ranking, validación de nombre y limitador de golpes`.

### Task 3: Máquina de estados del juego

**Files:**
- Create: `src/game/gameReducer.js`, `src/game/gameReducer.test.js`, `src/game/useGame.js`

**Interfaces:**
- Consumes: `rules.js` (Task 1), `createHitLimiter` (Task 2).
- Produces:
  - `initialState = { phase:'menu', level:1, hits:0, required:15, points:0, levelsCleared:0, countdownEndsAt:null, deadline:null, lastLevelPoints:0, secondsLeftAtBreak:0 }`
  - `phase ∈ 'menu' | 'countdown' | 'playing' | 'levelCleared' | 'gameOver'`
  - `gameReducer(state, action)`, con acciones (todas llevan `now` en ms cuando dependen del tiempo):
    - `{type:'START', now}` → nivel 1, puntos 0, `phase:'countdown'`, `countdownEndsAt = now + 3000`.
    - `{type:'TICK', now}` → en `countdown`, si `now >= countdownEndsAt` pasa a `playing` con `deadline = now + 10000`. En `playing`, si `now >= deadline` pasa a `gameOver`.
    - `{type:'HIT', now}` → solo en `playing` y con `now < deadline`: `hits+1`. Si `hits === required`, pasa a `levelCleared`, suma `levelPoints(level, (deadline-now)/1000)` a `points` (y lo guarda en `lastLevelPoints`) e incrementa `levelsCleared`.
    - `{type:'NEXT_LEVEL', now}` → solo desde `levelCleared`: `level+1`, `hits 0`, `required = hitsRequired(level+1)`, `phase:'countdown'`.
    - `{type:'TO_MENU'}` → `initialState`.
  - `useGame() => { state, start(), hit() => boolean, nextLevel(), toMenu(), timeLeft: number }`: corre un bucle `requestAnimationFrame` que despacha `TICK` con `performance.now()` mientras la fase sea `countdown` o `playing`. `hit()` pasa por el limitador y devuelve `true` si el golpe contó (para que la escena dispare la animación solo en ese caso). `timeLeft` en segundos con un decimal.

- [ ] **Step 1: Pruebas que fallan** (reducer puro):

```js
let s = gameReducer(initialState, {type:'START', now:0})
expect(s.phase).toBe('countdown')
expect(gameReducer(s, {type:'HIT', now:100}).hits).toBe(0)        // Review Focus 1
s = gameReducer(s, {type:'TICK', now:3000}); expect(s.phase).toBe('playing'); expect(s.deadline).toBe(13000)
for (let i=0;i<14;i++) s = gameReducer(s,{type:'HIT', now:4000})
s = gameReducer(s, {type:'HIT', now:12999.9})                     // Review Focus 2
expect(s.phase).toBe('levelCleared'); expect(s.levelsCleared).toBe(1)
expect(s.points).toBe(100)                                        // 100 + round(0.0001*50)
expect(gameReducer(s,{type:'HIT', now:13000}).hits).toBe(15)      // no cuenta en levelCleared
s = gameReducer(s, {type:'NEXT_LEVEL', now:20000})
expect(s).toMatchObject({level:2, hits:0, required:21, phase:'countdown'})
s = gameReducer(s, {type:'TICK', now:23000})
expect(gameReducer(s, {type:'HIT', now:33000}).hits).toBe(0)       // now === deadline no cuenta
// Review Focus 5: un TICK muy tardío (pestaña oculta) termina el nivel
expect(gameReducer(s, {type:'TICK', now:999999}).phase).toBe('gameOver')
```
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar `gameReducer.js` y luego `useGame.js` (`useReducer`, limitador creado con `useRef`, reiniciado en `START`).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: máquina de estados del juego`.

### Task 4: Backend de Amplify y cliente de puntajes

**Files:**
- Create: `amplify/backend.ts`, `amplify/data/resource.ts`, `amplify/package.json` y `amplify/tsconfig.json` (los que genera `npm create amplify`), `src/scores/scoresApi.js`, `src/scores/scoresApi.test.js`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `rankScores`/`topScores` (Task 2), `sanitizeName` (Task 2).
- Produces:
  - `createScoresApi(client) => { fetchTopScores(n = 10): Promise<{ok:true, scores} | {ok:false, error:string}>, submitScore({name, level, points}): Promise<{ok:true, score} | {ok:false, error:string}> }`. Nunca lanza excepciones. `fetchTopScores` pagina `client.models.Score.list({ limit: 1000, nextToken })` hasta agotar los resultados y devuelve `topScores(...)`. `submitScore` aplica `sanitizeName` y rechaza `{ok:false, error:'Nombre inválido'}` sin llamar a la red.
  - `scoresApi` por defecto exportado, creado con `generateClient()` a nivel de módulo.

- [ ] **Step 1:** `npm create amplify@latest -y` (proyecto existente). Revisar que no sobrescriba archivos de `src/`.
- [ ] **Step 2:** `amplify/data/resource.ts`: modelo `Score` con `name: a.string().required()`, `level: a.integer().required()`, `points: a.integer().required()`; `.authorization(allow => [allow.publicApiKey().to(['create', 'read'])])`. `defineData` con `defaultAuthorizationMode: 'apiKey'` y `apiKeyAuthorizationMode: { expiresInDays: 365 }`. `backend.ts`: `defineBackend({ data })`, sin auth.
- [ ] **Step 3:** `AWS_PROFILE=student-cd AWS_REGION=us-east-1 npx ampx sandbox --once` → genera `amplify_outputs.json`. Si pide bootstrap de CDK, hacerlo y repetir el comando.
- [ ] **Step 4:** `src/main.jsx`: `Amplify.configure(outputs)` con `import outputs from '../amplify_outputs.json'`, antes del render.
- [ ] **Step 5: Pruebas que fallan** con un cliente falso (`{ models: { Score: { list: vi.fn(), create: vi.fn() } } }`):
  - `list` con dos páginas (la primera con `nextToken:'t'`) → `fetchTopScores` devuelve las de ambas páginas, ordenadas.
  - `list` que lanza `new Error('Network')` → `{ ok:false }`, sin excepción (Review Focus 3).
  - `list` que resuelve `{ errors:[{message:'Unauthorized'}] }` → `{ ok:false }`.
  - `submitScore({name:'  ', level:1, points:100})` → `{ok:false}` y `create` no se llamó.
  - `submitScore({name:' Ana ', level:2, points:300})` → `create` llamado con `{name:'Ana', level:2, points:300}`.
- [ ] **Step 6:** `npm test` → FAIL.
- [ ] **Step 7:** Implementar `scoresApi.js`.
- [ ] **Step 8:** `npm test` → PASS. Verificación real: con un script de Node rápido o la consola del navegador en `npm run dev`, `submitScore` y luego `fetchTopScores` devuelven el registro. Borrar ese registro de prueba con `aws dynamodb delete-item` (perfil `student-cd`) o dejarlo anotado.
- [ ] **Step 9:** Commit `feat: backend de Amplify con modelo Score y cliente de puntajes`.

### Task 5: Arte de cómic — piñatas, palo y papel picado

**Files:**
- Create: `src/game/levels.js` + `levels.test.js`, `src/components/scene/pinatas/*.jsx`, `Pinata.jsx`, `Cracks.jsx`, `Stick.jsx`, `src/components/hud/PapelPicado.jsx`, `src/dev/Gallery.jsx` (galería solo para desarrollo, cargada con `?gallery`)

**Interfaces:**
- Consumes: `damageStage` (Task 1).
- Produces:
  - `PINATAS = ['estrella','burro','estrellaDorada','olla','santa']`; `PALETTES`: 3 paletas de 3–4 colores tomados de la paleta global.
  - `levelTheme(level) => { pinata, palette, backgroundIndex }`. La piñata es `PINATAS[(level-1) % 5]`, la paleta es `PALETTES[Math.floor((level-1)/5) % PALETTES.length]` y `backgroundIndex = (level-1) % 5`.
  - Cada diseño: `<Estrella palette={string[]} />` etc. Es un `<g>` SVG en un `viewBox` común de `0 0 300 360`, con el punto de cuelgue en `(150, 0)`. Contorno `stroke="#1A1A1A"` de grosor 6, colores planos y sombra de trama (patrón SVG de puntos).
  - `<Pinata kind palette damage={0..3} innerRef />`: dibuja la cuerda, el diseño y `<Cracks stage={damage} />`. `innerRef` apunta al `<g>` que GSAP balancea y sacude.
  - `<Stick innerRef />`: palo de madera con vetas y cinta de papel de colores enrollada. El pivote queda en el extremo inferior (`transform-origin` en ese punto).
  - `<PapelPicado />`: banda superior de banderines calados en los 7 colores, en SVG repetido.

- [ ] **Step 1: Prueba que falla** `levels.test.js`: `levelTheme(1).pinata === 'estrella'`, `levelTheme(5).pinata === 'santa'`, `levelTheme(6).pinata === 'estrella'`, `levelTheme(6).palette !== levelTheme(1).palette`, `levelTheme(7).backgroundIndex === 1`.
- [ ] **Step 2:** `npm test` → FAIL. Implementar `levels.js`. `npm test` → PASS.
- [ ] **Step 3:** Dibujar los 5 diseños, `Cracks` (etapa 1 grietas, 2 grietas + huecos con relleno oscuro, 3 piezas desplazadas), `Stick` y `PapelPicado`.
- [ ] **Step 4:** `Gallery.jsx` muestra las 5 piñatas × 4 etapas de daño, más el palo y el papel picado. Verificación: con Playwright, capturar `/?gallery` a 390×844 en `deviceScaleFactor: 1` y revisar la imagen: contornos gruesos, colores de la paleta, ninguna figura cortada y daño visible en cada etapa. Ajustar hasta que pase.
- [ ] **Step 5:** Commit `feat: piñatas de cómic, palo y papel picado`.

### Task 6: Fondos de Unsplash

**Files:**
- Create: `public/backgrounds/bg-1.webp` … `bg-5.webp`, `src/game/backgrounds.js`

**Interfaces:**
- Produces: `BACKGROUNDS: { src: string, photographer: string, url: string }[]` de longitud 5 (`src` = `/backgrounds/bg-N.webp`; `url` = página de la foto en Unsplash).

- [ ] **Step 1:** Buscar en Unsplash 5 fotos de barrios, vecindades, calles coloridas, patios con papel picado o fachadas mexicanas (búsquedas: "vecindad mexico", "mexico street colorful", "papel picado street", "guanajuato street", "mexico city neighborhood"). Preferir fotos verticales o con el centro despejado. Anotar el fotógrafo y la URL de cada una.
- [ ] **Step 2:** Descargar con `curl` desde `images.unsplash.com/...?w=1600&fm=webp&q=75` (o descargar y convertir) y guardar como `bg-N.webp`. Cada archivo debe pesar ≤ 400 KB (`ls -lh`).
- [ ] **Step 3:** Escribir `backgrounds.js` con los créditos reales.
- [ ] **Step 4:** Commit `feat: fondos de barrios mexicanos (Unsplash)`.

### Task 7: Escena jugable — entrada, animaciones, HUD y sonido

**Files:**
- Create: `src/components/scene/GameScene.jsx`, `Burst.jsx`, `ImpactText.jsx`, `src/components/hud/Hud.jsx`, `src/audio/sfx.js`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `useGame` (Task 3), `levelTheme` (Task 5), `BACKGROUNDS` (Task 6), `Pinata`, `Stick`, `PapelPicado` (Task 5), `damageStage` (Task 1).
- Produces:
  - `<GameScene game={useGame()} sfx muted />`. Fondo `object-cover` con el velo cálido (gradiente de rosa a naranja, `mix-blend-mode: multiply`, ~35%) y el crédito del fotógrafo abajo a la izquierda (`text-xs`, enlace). El área de juego usa `onPointerDown` y la clase `touch-none select-none`, y llama `e.preventDefault()`. En cada golpe aceptado (`game.hit() === true`):
    1. Swing del palo con GSAP: `rotation` de reposo (−35°) a +25° en 0.07 s y regreso en 0.15 s. Se cancela el tween previo para que los taps rápidos no se encimen.
    2. Sacudida de la piñata y empujón al lado contrario, sobre un balanceo continuo `sine.inOut`.
    3. `<ImpactText>` en la posición del tap, con un texto al azar de `['¡PUM!','¡ZAS!','¡PAF!','¡TOING!']` y `'¡CRACK!'` al cambiar de etapa de daño. Escala de 0 a 1.2 y se desvanece en 0.5 s.
    4. `sfx.hit()`.
  - Al pasar a `levelCleared`: `<Burst>` con unos 40 dulces y confeti (formas SVG: caramelos envueltos, cacahuates, cuadritos de colores) que salen de la piñata con gravedad simulada por GSAP en 1.2 s, más `sfx.break()`.
  - `<Hud timeLeft level hits required />`, fijo arriba bajo el papel picado: número grande `font-comic` (`10.0` → `0.0`) y barra que se vacía de cempasúchil a rojo. En los últimos 3 s la barra se pone roja y el número pulsa. A los lados, `Nivel N` y `golpes / requeridos`. Respetar `env(safe-area-inset-top)`.
  - `createSfx() => { hit(), break(), tick(), countdown(), setMuted(bool) }` con Web Audio. El `AudioContext` se crea o reanuda en el primer gesto del usuario. `tick()` suena una vez por segundo en los últimos 3 s.

- [ ] **Step 1:** Implementar `sfx.js`, `Hud.jsx`, `ImpactText.jsx`, `Burst.jsx` y `GameScene.jsx`. En `App.jsx`, montar la escena con un botón temporal de "Empezar" que llama `game.start()`.
- [ ] **Step 2:** `npm test` → PASS (sin regresiones). `npm run lint` → sin errores.
- [ ] **Step 3: Verificación con Playwright** (`devices['iPhone 13']`): iniciar, esperar 3.2 s y tocar el centro 15 veces con `page.touchscreen.tap` cada 80 ms. Esperar fase `levelCleared` (exponer `data-phase` en el contenedor raíz). Capturas a mitad del nivel y al romper. Revisar que el HUD se lea, que el palo esté en posición, que la piñata muestre daño y que salgan los dulces. Revisar también que la página no hizo scroll ni zoom (`window.scrollY === 0`, `visualViewport.scale === 1`).
- [ ] **Step 4:** Commit `feat: escena jugable con palo, piñata, HUD y sonido`.

### Task 8: Modales, flujo completo y tabla de puntajes

**Files:**
- Create: `src/components/ui/Modal.jsx`, `StartModal.jsx`, `Countdown.jsx`, `LevelClearedModal.jsx`, `GameOverModal.jsx`, `Leaderboard.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useGame` (Task 3), `scoresApi` (Task 4), `GameScene` y `createSfx` (Task 7).
- Produces (UI): `<Modal open title>` es una tarjeta centrada con borde negro grueso, sombra dura desplazada (`8px 8px 0 #1A1A1A`), fondo crema `#FFF6E5`, título `font-comic` y animación de entrada con GSAP (escala con rebote). `<Leaderboard scores highlightId? status:'loading'|'ok'|'error' onRetry />`.

- [ ] **Step 1:** Flujo en `App.jsx` según `state.phase`:
  - `menu` → `StartModal`: título "¡Dale, Dale!", subtítulo "Rompe la piñata antes de que se acabe el tiempo", botón grande "¡Jugar!", top 10 (lo carga al abrirse) y botón de sonido 🔊/🔇 (se recuerda en `localStorage`, con `try/catch`).
  - `countdown` → `Countdown`: "3", "2", "1", "¡Dale!" gigantes en `font-comic`, con `sfx.countdown()` en cada número. Los taps en este momento no cuentan.
  - `levelCleared` → `LevelClearedModal`: "¡Nivel N superado!", `+lastLevelPoints` puntos (con el desglose de bonus por tiempo), total acumulado y botón "Siguiente nivel" que llama `nextLevel()`.
  - `gameOver` → `GameOverModal`: "¡Se acabó el tiempo!", niveles superados y puntos, input de nombre (`maxLength` 20, `autoComplete="nickname"`, `enterKeyHint="done"`) y botón "Guardar". Mientras guarda, el botón queda deshabilitado con el texto "Guardando…" (Review Focus 4). Al terminar se muestra la tabla con tu fila resaltada, o "No se pudo guardar" con la opción "Reintentar". Botones "Jugar otra vez" (`start()`) y "Menú" (`toMenu()`).
  - En la tabla, cada fila muestra posición (🥇🥈🥉 para los 3 primeros), nombre, `Nivel N` y puntos.
- [ ] **Step 2:** `npm test` y `npm run lint` → PASS.
- [ ] **Step 3: Verificación con Playwright:** recorrido completo en el iPhone 13 emulado. Menú → jugar → romper el nivel 1 → siguiente → no tocar hasta que se acabe el tiempo → escribir "Prueba" → doble clic rápido en "Guardar". La tabla muestra **una sola** fila "Prueba" (consultar `fetchTopScores` y contar). Capturas de cada modal. Borrar el registro de prueba.
- [ ] **Step 4:** Commit `feat: modales, flujo de partida y tabla de puntajes`.

### Task 9: Pulido para móvil y prueba de humo

**Files:**
- Create: `scripts/smoke.mjs`
- Modify: lo que salga de la revisión

- [ ] **Step 1:** `scripts/smoke.mjs` (se corre con `node scripts/smoke.mjs <url>`): repite el recorrido de la Task 8 sin guardar puntaje en iPhone 13, Pixel 7 y escritorio 1280×800. Falla (exit 1) si hay errores en consola, si `scrollY !== 0`, o si el HUD o la piñata quedan fuera del viewport (`boundingBox`). Agregar el script `"smoke"` a `package.json`.
- [ ] **Step 2:** `npm run build && npm run preview` y luego `node scripts/smoke.mjs http://localhost:4173` → exit 0. En horizontal y en escritorio, la escena queda centrada con un ancho máximo de ~480 px y el fondo cubre toda la pantalla.
- [ ] **Step 3:** Quitar la galería del bundle de producción (import dinámico condicionado a `import.meta.env.DEV`). Revisar que `dist/` pese menos de 3 MB incluidas las imágenes.
- [ ] **Step 4:** Commit `chore: pulido móvil y prueba de humo`.

### Task 10: Publicar en Amplify Hosting

> Paso hacia afuera: **confirmar con el usuario** el nombre y la visibilidad del repo de GitHub antes de crearlo.

**Files:**
- Create: `amplify.yml`

- [ ] **Step 1:** `amplify.yml` igual al de la referencia de Amplify: backend `npm ci --cache .npm --prefer-offline` + `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`; frontend `npm run build`; `baseDirectory: dist`; caché `.npm` y `node_modules`. Commit.
- [ ] **Step 2:** Crear el repo con `gh repo create <nombre> --private --source . --push` (cuenta `johnkleinad`; el nombre se acuerda con el usuario).
- [ ] **Step 3:** Con `--profile student-cd --region us-east-1`: `aws amplify create-app --name dale-dale-pinatas --repository github.com/<owner>/<repo> --access-token "$(gh auth token)"`, crear el rol `AmplifyBackendRole-<appId>` con la política `AmplifyBackendDeployFullAccess` y asignarlo con `update-app`, luego `create-branch --branch-name main` y `start-job --job-type RELEASE`.
- [ ] **Step 4:** Esperar a que `list-jobs` muestre `SUCCEED`. Correr `node scripts/smoke.mjs https://main.<appId>.amplifyapp.com` → exit 0. Guardar y leer un puntaje de prueba en producción y luego borrarlo.
- [ ] **Step 5:** Agregar al `README.md` cómo jugar, cómo desarrollar (sandbox con `student-cd`) y la URL de producción. Commit y push.
