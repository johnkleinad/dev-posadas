# Modos de juego (Clásico y Fiesta) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un selector de modo (Clásico y Fiesta) con tabla de campeones por modo, una tiendita de 6 power-ups entre niveles en Fiesta, y una arquitectura en la que los modos son recetas y los power-ups son efectos.

**Architecture:**
- El motor sigue siendo el reducer puro `gameReducer`. Gana acciones (`START {modeId}`, `BUY`, `HIT {playerId}`) y aplica *efectos* genéricos que leen los power-ups.
- Los modos y power-ups son datos en `src/game/modes.js` y `src/game/powerups.js`. La congelación (Escarcha) se calcula de forma determinista al empezar el nivel: se fija la ventana y se recorre el `deadline`, así el reloj mostrado es una función pura de `(state, now)`.
- Los puntajes llevan un campo `mode` opcional y se filtran en el cliente.

**Tech Stack:** Vite 8, React 19, Tailwind 4, GSAP 3, Vitest (node + jsdom), Amplify Gen2 (Amplify Data, API key), Playwright (smoke).

**Spec:** `docs/superpowers/specs/2026-11-21-modos-de-juego-design.md`

## Global Constraints

- Se trabaja en la rama `beta`. No se hace merge a `main` sin que el usuario lo pida.
- El Clásico no cambia su comportamiento, salvo dos cosas: sin límite de golpes y "puntos" → "dulces" en la interfaz. Siguen igual: `hitsRequired(n) = 15 + 6·(n−1)`, 10 s por nivel y `levelPoints = 100·n + round(max(0,s)·50)`.
- Al modelo `Score` solo se le agrega `mode: a.string()` opcional. No se renombra ni se borra nada. Los permisos se quedan en `allow.publicApiKey().to(['create','read'])`.
- Las filas sin `mode` cuentan como `'clasico'`.
- No subir `amplify_outputs.json`. No escribir datos de prueba en producción; las pruebas en vivo van solo al sandbox.
- Toda la interfaz en español, con el estilo cómic actual (componentes `Modal` y `ComicButton`, tokens de `index.css`).
- Precios: `precio = base × nivel a jugar`. Bases: Velita 40, Escarcha 40, Luces de bengala 50, Ponche 60, Dulce de tamarindo 90, Pedir posada 120.
- Máximo 1 power-up por nivel. Aplica solo al siguiente nivel y no se acumula.
- El bonus por segundos sobrantes usa el **tiempo mostrado** (con la Escarcha, el reloj se queda en 2.0).
- Cada commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Pedir posada + Escarcha/Velita en el reintento:** el reintento corre sin power-up. Ni la ventana de congelación ni los segundos extra pueden sobrevivir al reintento. La prueba va en la Tarea 3.
2. **`BUY` inválido:** en Clásico, sin dulces suficientes, fuera de `levelCleared` o con un id desconocido, el estado no cambia. La prueba va en la Tarea 3.
3. **Multiplicador al romper:** con Tamarindo, a `hits = required − 1`, un golpe rompe la piñata y el contador queda en `required`, no en `required + 1`. La prueba va en la Tarea 3.
4. **Filas viejas:** un puntaje sin `mode` aparece en la tabla de Clásico y no en la de Fiesta. La prueba va en la Tarea 4.
5. **"Otra vez" y "Menú":** "Otra vez" reinicia el mismo modo y "Menú" vuelve a la pantalla de ese modo. Además, con la Velita (12 s) la barra del HUD nunca pasa del 100 %. Las pruebas van en las Tareas 3 y 6.

---

### Task 1: Quitar el límite de golpes

**Files:**
- Delete: `src/game/hitLimiter.js`, `src/game/hitLimiter.test.js`
- Modify: `src/game/useGame.js`, que ya no importa ni usa el limitador

**Interfaces:**
- Produces: `useGame().hit()`, que devuelve `true` siempre que `phase === 'playing'` y `now < deadline`.

- [ ] **Step 1:** Borrar los dos archivos y quitar `limiter` (el ref, el reset en `start` y la condición en `hit`) de `useGame.js`.
- [ ] **Step 2:** Run `npm test && npm run lint`. Expected: todas las pruebas pasan (36 − las de hitLimiter), sin errores nuevos de lint.
- [ ] **Step 3:** Commit `feat: sin límite de golpes por segundo`.

### Task 2: Power-ups y modos como datos

**Files:**
- Create: `src/game/powerups.js`, `src/game/modes.js`
- Test: `src/game/powerups.test.js`, `src/game/modes.test.js`

**Interfaces:**
- Produces (`powerups.js`):
  - `POWER_UPS`: array de `{ id, name, description, base, effects }`, con estos ids:
    - `'velita'`, con efecto `{ extraSeconds: 2 }`
    - `'escarcha'`, con efecto `{ freezeClock: { atSecondsLeft: 2, seconds: 2 } }`
    - `'tamarindo'`, con efecto `{ hitMultiplier: { value: 2 } }`
    - `'bengala'`, con efecto `{ hitMultiplier: { value: 3, lastSeconds: 3 } }`
    - `'ponche'`, con efecto `{ requiredFactor: 0.75 }`
    - `'posada'`, con efecto `{ retryOnTimeout: true }`
  - `getPowerUp(id) → PowerUp | null`
  - `priceFor(id, level) → number`, igual a `base × level`
  - `levelSetup(level, powerUp|null) → { required, levelSeconds }`
  - `hitValue(powerUp|null, shownSecondsLeft) → 1|2|3`
- Produces (`modes.js`):
  - `MODES`: `[{ id:'clasico', name:'Clásico', description, rules, shop:null, boardId:'clasico' }, { id:'fiesta', name:'Fiesta', description, rules, shop:[los 6 ids], boardId:'fiesta' }]`. `rules` es el texto de reglas que se muestra en la pantalla del modo.
  - `getMode(id) → Mode`, que devuelve Clásico si el id no existe.

- [ ] **Step 1: Pruebas.**
  - `priceFor('tamarindo', 5) === 450` y `priceFor('velita', 2) === 80`.
  - `levelSetup(1, null)` → `{ required: 15, levelSeconds: 10 }`.
  - `levelSetup(1, velita).levelSeconds === 12`.
  - `levelSetup(1, ponche).required === 12`, que es `ceil(15 × 0.75)`.
  - `levelSetup(2, ponche).required === 16`, que es `ceil(21 × 0.75)`.
  - `hitValue(null, 5) === 1` y `hitValue(tamarindo, 9) === 2`.
  - `hitValue(bengala, 3.01) === 1` y `hitValue(bengala, 3) === 3`.
  - `getMode('x').id === 'clasico'`.
  - `getMode('fiesta').shop` tiene 6 ids y todos existen en `POWER_UPS`.
- [ ] **Step 2:** Run `npx vitest run src/game/powerups.test.js src/game/modes.test.js`. Expected: FAIL (módulos inexistentes).
- [ ] **Step 3:** Implementar los dos módulos. `levelSetup` parte de `hitsRequired(level)` y `LEVEL_SECONDS`. Los textos de `name` y `description` salen del spec.
- [ ] **Step 4:** Run lo mismo. Expected: PASS.
- [ ] **Step 5:** Commit `feat: recetas de modos y power-ups`.

### Task 3: Motor con modos, tiendita y efectos

**Files:**
- Modify: `src/game/gameReducer.js`, `src/game/clock.js`, `src/game/useGame.js`
- Test: `src/game/gameReducer.test.js`, `src/game/clock.test.js`

**Interfaces:**
- Consumes: `getMode`, `getPowerUp`, `priceFor`, `levelSetup` y `hitValue` (Tarea 2).
- Produces:
  - Estado nuevo:
    - `modeId` (default `'clasico'`) y `wallet`.
    - `pending` y `active`: id de power-up o `null`.
    - `levelSeconds`, `levelStartedAt`, `freezeStart` y `freezeEnd`: ms o `null`.
    - `retryUsed`, `retrying` (bool, solo para mostrar el aviso) y `players: [{ id: 'local' }]`.
  - Acciones:
    - `START {now, modeId}`: si no viene `modeId`, conserva `state.modeId`, así "Otra vez" repite el modo.
    - `BUY {powerUpId}`.
    - `HIT {now, playerId}`.
    - `NEXT_LEVEL {now}`.
    - `TICK {now}`.
    - `TO_MENU`: conserva `modeId`.
  - `clock.js`: `shownSecondsLeft(state, now)` y `timeLeftAt(state, now)`, que usa `state.levelSeconds` y la congelación.
  - `useGame()` agrega `buy(id)` y `sinceStart` (ms desde `levelStartedAt`, o `Infinity` si no se está jugando).

Reglas del motor (de este bloque salen las pruebas):

- **`beginCountdown`:**
  - `active = pending` y `pending = null`.
  - `required` y `levelSeconds` salen de `levelSetup(level, active)`.
- **`TICK` de cuenta regresiva a juego:**
  - `levelStartedAt = now` y `deadline = now + levelSeconds·1000`.
  - Si `active` tiene `freezeClock`:
    - `freezeStart = now + (levelSeconds − atSecondsLeft)·1000`
    - `freezeEnd = freezeStart + seconds·1000`
    - `deadline += seconds·1000`
- **`shownSecondsLeft`:**
  - Cálculo: `(deadline − now − congelaciónPendiente) / 1000`, con piso en 0 y tope en `levelSeconds`.
  - `congelaciónPendiente = clamp(freezeEnd − max(now, freezeStart), 0, freezeEnd − freezeStart)`.
- **`HIT`:**
  - `hits = min(required, hits + hitValue(active, shown))`.
  - Al romper, el bonus usa `shown`.
  - Los puntos ganados se suman a `points` y a `wallet`.
- **`BUY`:**
  - Solo cuenta si el modo tiene `shop` que incluya el id, `phase === 'levelCleared'`, `pending === null` y `wallet ≥ priceFor(id, level + 1)`.
  - Entonces `wallet -= precio` y `pending = id`.
  - En cualquier otro caso, el mismo estado.
- **`TICK` al vencer el tiempo:**
  - Si `active` tiene `retryOnTimeout` y `!retryUsed`: `beginCountdown` del mismo nivel con `pending = null` (sin power-up), `retryUsed = true` y `retrying = true`.
  - Si no: `gameOver`.
- **`NEXT_LEVEL`:** `retryUsed = false` y `retrying = false`.

- [ ] **Step 1: Pruebas** en `gameReducer.test.js`. Las existentes deben seguir pasando sin cambios.
  - `START` sin `modeId` → `modeId: 'clasico'`, `wallet: 0` y `levelSeconds: 10`.
  - Partida de Fiesta: se rompe el nivel 1 en `now = 10000` (3 s mostrados) → `wallet === 250` y `points === 250`.
  - `BUY 'velita'` con `wallet = 250` → `wallet = 170` y `pending = 'velita'`. Un segundo `BUY` no cambia nada.
  - Tras `NEXT_LEVEL` y `TICK`, el `deadline` es el arranque + 12000.
  - `BUY` en Clásico, en `playing`, con `'xyz'` o sin dulces suficientes → `toBe(state)`.
  - Tamarindo, nivel con `required = 21`, 10 golpes llevan `hits` a 20 y uno más rompe con `hits === 21`. **(Review Focus 3)**
  - Escarcha: con arranque en t, se crea la ventana `[t+8000, t+10000]` y `deadline = t+12000`. `shownSecondsLeft` vale 2.0 en t+8000, t+9000 y t+10000, y 1.0 en t+11000. Romper en t+9000 da un bonus de 100 (2 s).
  - Pedir posada: el tiempo vence → `phase: 'countdown'`, mismo nivel, `retryUsed: true` y `active: null` al arrancar. Volver a vencer → `gameOver`.
  - Reintento después de comprar Escarcha y Pedir posada en niveles distintos: el reintento queda con `freezeStart === null` y `levelSeconds === 10`. **(Review Focus 1)**
  - `TO_MENU` desde Fiesta conserva `modeId: 'fiesta'`. Un `START` sin `modeId` sigue en Fiesta. **(Review Focus 5)**
- [ ] **Step 2:** En `clock.test.js`, `timeLeftAt` con `levelSeconds: 12` al arrancar → `12`, nunca más de `levelSeconds`.
- [ ] **Step 3:** Run `npx vitest run src/game`. Expected: FAIL en las pruebas nuevas.
- [ ] **Step 4:** Implementar el reducer, `clock.js` y `useGame` (`buy`, `sinceStart`, `start(modeId)`).
- [ ] **Step 5:** Run `npm test`. Expected: PASS en todo.
- [ ] **Step 6:** Commit `feat: motor con modos, tiendita y efectos de power-ups`.

### Task 4: Puntajes por modo

**Files:**
- Modify: `amplify/data/resource.ts`, `src/scores/createScoresApi.js`, `src/game/useLeaderboard.js`
- Test: `src/scores/createScoresApi.test.js`

**Interfaces:**
- Produces:
  - `Score` agrega `mode: a.string()` (opcional).
  - `fetchTopScores(n = 10, boardId = 'clasico')`: filtra por `(row.mode ?? 'clasico') === boardId` antes de `topScores`.
  - `submitScore({ name, level, points, mode })`: envía `mode`.
  - `useLeaderboard(api, active, boardId)`: vuelve a cargar cuando cambia `boardId`.

- [ ] **Step 1: Pruebas** con el cliente falso existente.
  - Filas `{mode: undefined}`, `{mode: 'clasico'}` y `{mode: 'fiesta'}`: `'clasico'` devuelve las 2 primeras y `'fiesta'` solo la última. **(Review Focus 4)**
  - `submitScore` pasa `mode: 'fiesta'` a `create`.
- [ ] **Step 2:** Run `npx vitest run src/scores`. Expected: FAIL.
- [ ] **Step 3:** Implementar. En el esquema, solo agregar `mode: a.string()`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Run `npx tsc --noEmit -p amplify` si existe tsconfig; si no, confiar en el chequeo de tipos del sandbox. El sandbox en modo watch despliega solo. Revisar su salida: `Deployment completed`.
- [ ] **Step 6:** Commit `feat: tabla de campeones por modo`.

### Task 5: Menú en dos pantallas

**Files:**
- Create: `src/components/ui/ModeSelectModal.jsx`, `src/components/ui/ModeModal.jsx`
- Delete: `src/components/ui/StartModal.jsx`. Su `SpeakerIcon` y el título pasan a `ModeSelectModal`.
- Modify: `src/App.jsx`, `src/components/ui/Leaderboard.jsx` (texto "dulces")
- Test: `src/components/ui/ModeSelectModal.test.jsx` (jsdom)

**Interfaces:**
- Consumes: `MODES` y `getMode` (Tarea 2); `useGame().start(modeId)` y `state.modeId` (Tarea 3); `useLeaderboard(api, active, boardId)` (Tarea 4).
- Produces:
  - `ModeSelectModal({ onPick(modeId), muted, onToggleMute })`, con una tarjeta por cada elemento de `MODES`.
  - `ModeModal({ mode, board, onPlay, onBack })`, con nombre, reglas, "¡Jugar!", `<Leaderboard>` y "← Modos".
  - En `App`, la vista del menú es `screen: 'modes' | 'mode'`. Arranca en `'modes'`. Al elegir un modo, se guarda `selectedModeId` y se pasa a `'mode'`. `toMenu` desde fin de partida deja `screen = 'mode'` con el modo de `state.modeId`.

- [ ] **Step 1: Prueba.** Renderizar `ModeSelectModal` y verificar que aparecen "Clásico" y "Fiesta". Click en "Fiesta" llama a `onPick('fiesta')`. Esperar a que el modal esté `ready` (mismo patrón que `Modal.test.jsx`).
- [ ] **Step 2:** Run `npx vitest run src/components/ui`. Expected: FAIL.
- [ ] **Step 3:** Implementar los componentes y el flujo en `App`. La tabla solo está activa en la pantalla del modo y en `gameOver`, con el `boardId` del modo.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: menú de selección de modo y pantalla por modo`.

### Task 6: Tiendita, HUD y textos en dulces

**Files:**
- Create: `src/components/ui/Shop.jsx`, `src/components/ui/powerUpIcons.jsx` (íconos SVG de cómic por id)
- Modify: `src/components/ui/LevelClearedModal.jsx`, `src/components/hud/Hud.jsx`, `src/components/ui/GameOverModal.jsx`, `src/components/scene/GameScene.jsx`, `src/App.jsx`
- Test: `src/components/ui/Shop.test.jsx` y `src/components/hud/Hud.test.jsx` (jsdom)

**Interfaces:**
- Consumes: `priceFor`, `getPowerUp` y `getMode` (Tarea 2); `buy` y `sinceStart` (Tarea 3).
- Produces:
  - `Shop({ shop: string[], level: number, wallet: number, selected: string|null, onSelect(id|null) })`.
  - `LevelClearedModal({ state, onNext(selectedId|null) })`. En Fiesta muestra los dulces disponibles y la `Shop`. `App` traduce `onNext(id)` a `buy(id)` si hay id, y luego `nextLevel()`.
  - `Hud({ timeLeft, levelSeconds, level, hits, required, activePowerUp, frozen })`.

- [ ] **Step 1: Pruebas.**
  - `Shop` con `wallet = 100` y `level = 2`: la tarjeta de Velita (80) está habilitada y la de Tamarindo (180) deshabilitada.
  - Click en Velita llama a `onSelect('velita')`. Click en la tarjeta ya elegida llama a `onSelect(null)`.
  - `Hud` con `timeLeft = 12` y `levelSeconds = 12` → barra al `100%`. Con `timeLeft = 12` y `levelSeconds = 10` también se queda en `100%`. **(Review Focus 5)**
- [ ] **Step 2:** Run `npx vitest run src/components`. Expected: FAIL.
- [ ] **Step 3: Implementar.**
  - Tiendita: el saldo se muestra como "Tienes N dulces".
  - HUD:
    - Chapita con el ícono y nombre del power-up activo.
    - Número en color hielo (`text-turquesa`) mientras `frozen`. `frozen` lo calcula `useGame` y es verdadero si `now ∈ [freezeStart, freezeEnd)`.
  - El "¡Dale!" se muestra cuando `sinceStart < 600`.
  - "Puntos" pasa a "dulces" en `LevelClearedModal`, `GameOverModal` y `Leaderboard`.
  - Al recibir `retrying`, `Countdown` muestra antes "¡Pidiendo posada!".
  - `GameOverModal` guarda con `mode: getMode(state.modeId).boardId`.
- [ ] **Step 4:** Run `npm test && npm run lint && npm run build`. Expected: PASS, sin errores nuevos de lint, build OK.
- [ ] **Step 5:** Commit `feat: tiendita de Fiesta, HUD de power-ups y dulces`.

### Task 7: Verificación en vivo y publicación en beta

**Files:**
- Modify: `scripts/smoke.mjs`, que ahora elige Clásico antes de jugar (pantalla de modos → Clásico → ¡Jugar!) y además recorre Fiesta hasta la tiendita del nivel 1 sin comprar.
- Modify: `README.md`, con la sección de modos y power-ups.

- [ ] **Step 1:** Run `PW_CHROME=… npm run smoke -- http://localhost:5173/` contra el dev server, que usa el sandbox. Expected: `Prueba de humo OK` en los 3 dispositivos.
- [ ] **Step 2: Prueba manual con Playwright contra el sandbox (nunca producción).**
  - Guardar una partida de Fiesta.
  - Verificar que aparece en la tabla de Fiesta y no en la de Clásico.
- [ ] **Step 3:** Commit `chore: prueba de humo con modos y README` y `git push origin beta`.
- [ ] **Step 4:** Esperar el job de Amplify de `beta`. Expected: `SUCCEED`. Correr el smoke contra `https://beta.d1d7zmugu9x1aq.amplifyapp.com/`. Expected: OK.
