# ¡Dale, Dale! — Modos de juego: Clásico y Fiesta (diseño)

Fecha: 2026-11-21 · Proyecto: `dev-posadas` · Rama: `beta` · Estado: aprobado
Parte de: [2026-11-20-pinatas-posadas-design.md](2026-11-20-pinatas-posadas-design.md) (el diseño original sigue vigente salvo lo que aquí cambia).

## Intención

El juego tiene hoy un solo modo. El usuario quiere elegir modo desde el menú de inicio:

- **Modo clásico:** el juego actual tal cual.
- **Modo fiesta:** la misma base, más una **tiendita entre niveles** donde se compran power-ups con los dulces (puntos) acumulados.

Habrá **más modos después**, y todos parten del clásico. El que ya tiene en mente es un **cooperativo para 2 personas, cada quien en su celular y unidas por un código de sala**, aplicable a Clásico y a Fiesta. Ese cooperativo **no entra en este paquete**, pero la arquitectura debe dejarlo fácil.

## Metas

1. Menú en dos pantallas (decisión del usuario): **(1) selección de modo** → **(2) pantalla del modo** con sus reglas, su tabla de campeones y "¡Jugar!".
2. **Tabla de campeones separada por modo.** Los puntajes que ya existen cuentan como Clásico.
3. Los puntos se llaman **dulces** en toda la interfaz de los dos modos.
4. Se **elimina el límite de 20 golpes por segundo** en todos los modos.
5. Fiesta: en el modal entre niveles aparece la **tiendita** con 6 power-ups.
6. Arquitectura en la que un modo nuevo es una **receta** (datos) sobre el motor del Clásico, y un power-up nuevo es una combinación de **efectos** que ya existen.

## Fuera de alcance

- El cooperativo en línea (salas, tiempo real, suscripciones). Solo se prepara el terreno (ver "Preparado para el cooperativo").
- "Mejor marca por jugador": **descartado** por el usuario. Cada partida sigue guardando su propia fila.
- Antitrampa en el servidor, cuentas de usuario.
- Elementos que caen o aparecen en escena para tocarlos. Se descartaron porque tocar uno no debe "robar" un golpe.

## Antimetas

- Que el Clásico cambie su comportamiento, fuera de quitar el límite de golpes y renombrar puntos a dulces.
- Que se pierdan o mezclen los puntajes de producción actuales.
- Que comprar en la tiendita te baje en la tabla y por eso nadie quiera usarla.
- Que agregar el tercer modo obligue a llenar el motor de `if (modo === …)`.

## Enfoques considerados

- **A. Modo = receta sobre el motor del Clásico. Power-up = efectos.** *(Elegido por el usuario.)* El motor (reducer puro) aplica efectos genéricos. Los modos y power-ups son datos.
- **B. Un motor por modo que envuelve al del Clásico.** Da más libertad, pero los power-ups tocan el reloj, que vive dentro del Clásico, y cada modo terminaría duplicando esa lógica.
- **C. Condiciones `si es fiesta…` en el motor actual.** Es lo más rápido hoy y se enreda al tercer modo.

## Decisiones del usuario

### Tiendita (solo Fiesta)

- Aparece en el modal de "¡Nivel superado!" antes de "Siguiente nivel".
- Se compra con los dulces **disponibles**: lo juntado menos lo gastado.
- **Máximo 1 power-up por nivel.** Lo comprado aplica solo al **siguiente nivel**, no se guarda para después y no se acumula. También se puede no comprar nada.

### Power-ups (nombres decididos por el usuario)

| Nombre | Efecto |
|---|---|
| **Velita** | El nivel dura 12 s en lugar de 10 (+2 s). |
| **Escarcha** | Cuando al reloj le quedan 2 s, se congela durante 2 s reales (con hielo en pantalla) y luego sigue. Los golpes cuentan durante la congelación. |
| **Dulce de tamarindo** | Cada golpe cuenta doble durante todo el nivel. |
| **Luces de bengala** | Cada golpe cuenta triple en los últimos 3 s del nivel. |
| **Ponche** | La piñata pide 25 % menos golpes (redondeado hacia arriba). |
| **Pedir posada** | Si se acaba el tiempo, repites ese mismo nivel una vez (nueva cuenta 3‑2‑1, sin power-up) en lugar de perder. |

### Tabla de campeones por modo

Cada modo tiene su propia tabla. Una partida de Fiesta nunca aparece en la tabla del Clásico, ni al revés.

## Decisiones de Claude (corregibles)

- **Ranking de Fiesta:** primero niveles superados y luego **dulces juntados en total**, sin restar lo gastado. Clásico queda igual: niveles, luego dulces. Los dos guardan "dulces juntados" en `points`.
- **Precios:** `precio = base × nivel que vas a jugar`. Así la tiendita sigue pidiendo decisiones en niveles altos, donde ganas más. Bases iniciales, ajustables:

  | Power-up | Base | Nivel 2 | Nivel 5 |
  |---|---|---|---|
  | Velita | 40 | 80 | 200 |
  | Escarcha | 40 | 80 | 200 |
  | Luces de bengala | 50 | 100 | 250 |
  | Ponche | 60 | 120 | 300 |
  | Dulce de tamarindo | 90 | 180 | 450 |
  | Pedir posada | 120 | 240 | 600 |

  Referencia: superar el nivel n da `100·n + 50·segundosSobrantes`. Al terminar el nivel 1 con unos 3 s de sobra se tienen unos 250 dulces, que alcanzan para casi cualquier opción del nivel 2 pero no para todas las de los niveles siguientes si se compra seguido.
- **Golpes con multiplicador:** el contador `golpes / requeridos` sube de 2 en 2 o de 3 en 3, y el golpe que rompe la piñata puede pasar del requerido. Se muestra el tope (`15/15`).
- **Bonus con Escarcha:** el bonus por segundos sobrantes se calcula con el **tiempo que muestra el reloj**, no con el real. Romper la piñata durante la congelación cuenta como 2.0 s sobrantes. La pantalla y el puntaje siempre coinciden, y la Escarcha ayuda a romper la piñata pero no infla el bonus. La Velita sí lo sube, porque sus segundos extra se ven en el reloj. El motor guarda el `deadline` real y aparte la ventana de congelación. "Tiempo mostrado" = tiempo real restante menos lo que quede de congelación, con piso en 0.
- **"Dulces" en Clásico:** solo cambia el texto. Las fórmulas no cambian.
- **Navegación del menú:** la pantalla del modo tiene un botón "← Modos" para volver. Al terminar la partida, "Otra vez" repite el mismo modo y "Menú" regresa a la pantalla de ese modo, no a la selección.
- **Sin límite de golpes:** se borra `hitLimiter.js` con su prueba. Un golpe sigue contando solo si llega antes del deadline. El timestamp se mantiene como hoy, con `performance.now()` al recibir el evento.

## Arquitectura

### Motor (reducer puro, `src/game/`)

- Sigue siendo un reducer puro con acciones serializables y con `now` dentro de cada acción. Acciones nuevas o cambiadas:
  - `START {now, modeId}`
  - `BUY {powerUpId}`, válida solo en `levelCleared`, si el modo tiene tiendita, si alcanzan los dulces y si no se ha comprado nada en ese descanso
  - `HIT {now, playerId}`, donde `playerId` es `'local'` por ahora
- El estado gana estos campos:
  - `modeId`
  - `wallet` (dulces disponibles)
  - `pending` (power-up comprado para el siguiente nivel, o null)
  - `active` (power-up del nivel en curso, o null)
  - `levelSeconds` (duración del nivel en curso)
  - `freeze` (ventana de congelación: si ya se usó y hasta cuándo dura)
  - `retryUsed`
  - `players: [{id:'local'}]`
- Al empezar un nivel (`beginCountdown`), `pending` pasa a `active` y se calculan `required` y `levelSeconds` a partir de sus efectos.
- `clock.js` deja de usar la constante de 10 s y usa `state.levelSeconds`. Mientras dura la congelación, el tiempo mostrado se queda fijo.

### Efectos (piezas genéricas)

Cada power-up es `{ id, nombre, descripcion, base, effects }`. `effects` combina estas piezas:

| Pieza | Parámetros | La usa |
|---|---|---|
| `extraSeconds` | segundos | Velita |
| `hitMultiplier` | `{ value, lastSeconds? }`: sin `lastSeconds` aplica todo el nivel | Tamarindo, Bengala |
| `freezeClock` | `{ atSecondsLeft, seconds }` | Escarcha |
| `requiredFactor` | factor (0.75) | Ponche |
| `retryOnTimeout` | true | Pedir posada |

El motor solo conoce las piezas, no los power-ups. Un power-up nuevo es una entrada de datos nueva.

### Modos (recetas)

Cada modo es `{ id, nombre, descripcion, shop: [powerUpIds] | null, boardId }`, registrado en una lista. Clásico: `shop: null`, `boardId: 'clasico'`. Fiesta: los 6 power-ups, `boardId: 'fiesta'`. Las reglas base (golpes requeridos, 10 s, puntos) son las del Clásico para los dos. La receta deja lugar para sobrescribirlas en modos futuros, sin implementar sobrescrituras que hoy nadie usa.

### Preparado para el cooperativo (no se implementa)

- Que el motor sea puro, con acciones serializables y con timestamp, permite que más adelante un celular anfitrión aplique los `HIT {playerId}` que lleguen por suscripción de AppSync.
- `players` y `playerId` ya existen para que ese cambio no toque la forma del estado.
- Las estadísticas por jugador se dejan para entonces.

### Datos (Amplify)

- Al modelo `Score` se le agrega `mode: a.string()` **opcional**. Es un cambio aditivo: no recrea la tabla ni toca filas existentes.
- No se renombra ni se elimina nada. Los permisos siguen siendo solo create y read con la API key.
- Lectura: se traen todas las filas como hoy y se filtran en el cliente: `mode ?? 'clasico'` igual al `boardId` del modo. Las filas viejas sin `mode` cuentan como Clásico.
- `submitScore` envía `mode`.
- `useLeaderboard` se pide por `boardId`. Al terminar, el lugar `#N` se calcula dentro de la tabla de ese modo.

### Interfaz

- **Menú en dos pantallas (decisión del usuario):**
  1. **Selección de modo:** título "¡Dale, Dale!", botón de sonido y una tarjeta grande por modo (nombre, una línea de descripción, ícono). Tocar una tarjeta abre la pantalla de ese modo.
  2. **Pantalla del modo:** nombre del modo, reglas del modo, botón "¡Jugar!" y **la tabla de campeones de ese modo**, más "← Modos" para volver. No hay pestañas: cada modo muestra solo su tabla.
  - Las dos pantallas son modales sobre la escena, como hoy. La lista de modos sale del registro de modos, así que un modo nuevo aparece solo.
- **Nivel superado (`LevelClearedModal`):**
  - Muestra los dulces ganados y el total.
  - En Fiesta, además, la tiendita: 6 tarjetas con nombre, ícono SVG de cómic, efecto en una línea y precio.
  - Las tarjetas que no alcanzas se ven deshabilitadas. La elegida queda marcada y se puede cambiar o quitar antes de "Siguiente nivel".
  - La compra se confirma (`BUY`) al pulsar "Siguiente nivel". Así, cambiar de opinión no cuesta nada.
- **HUD:**
  - La barra de tiempo usa `levelSeconds`.
  - Si hay power-up activo, aparece una "chapita" con su nombre o ícono.
  - Durante la Escarcha, el número se pinta de color hielo.
  - Los dulces disponibles se ven en el modal, no en el HUD.
- **El "¡Dale!" de arranque** se muestra en los primeros 0.6 s del nivel, medidos desde el inicio y no con `timeLeft > 9.4`.
- **Pedir posada:**
  - Al perder con ella activa, en lugar de "¡Se acabó el tiempo!" aparece un aviso breve ("¡Pidiendo posada…!") y vuelve la cuenta 3‑2‑1 del mismo nivel.
  - La piñata se reinicia en daño 0.
- **Fin de partida:** dice "dulces" y guarda con el modo.
- **Textos:** todo en español, con el tono de comic actual.

## Restricciones que se conservan

- No perder ni mezclar los datos de producción.
- No dar a la API key permisos de update o delete.
- No subir `amplify_outputs.json` al repositorio.
- No escribir datos de prueba en producción. Las pruebas en vivo van al sandbox.
- Se trabaja en `beta`. Pasa a `main` solo cuando el usuario lo diga.

## Lo que queda al implementador

- Arte de los 6 íconos y del efecto de hielo de la Escarcha.
- Animaciones de la tiendita y de la chapita.
- Estructura exacta de archivos dentro de `src/game/` y `src/components/`.
- Ajuste fino de precios si al probar la economía se siente rota. Se documenta en el commit.
