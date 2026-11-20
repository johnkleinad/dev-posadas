# ¡Dale, Dale! — Juego web de piñatas (diseño)

Fecha: 2026-11-20 · Proyecto: `dev-posadas` · Estado: aprobado

## Intención

Juego web para un **concurso**. Lo jugarán pocas personas, principalmente en celular (taps) y también en escritorio (clicks). El objetivo es que se vea espectacular y que golpear se sienta bien: colores de posada y Navidad, piñatas 2D estilo cómic y fondos de barrios y vecindades mexicanas. Una tabla de puntajes guarda los resultados para saber quién ganó.

## Metas

- Pantalla de inicio → partida con niveles infinitos → fin de partida → guardar puntaje.
- Cada nivel dura **10 segundos fijos** y pide **más golpes** que el anterior.
- Cada nivel cambia el **diseño de la piñata** y el **fondo** (fotos de Unsplash).
- **Contador de tiempo** visible en la parte superior.
- Un **palo de madera** que se mueve y golpea con cada tap o click.
- **Tabla de puntajes** persistente con Amplify.
- Publicado en **Amplify Hosting**.

## Fuera de alcance

- Cuentas de usuario e inicio de sesión.
- Antitrampa a nivel servidor (con pocos jugadores se acepta el riesgo).
- 3D, física real o multijugador en tiempo real.

## Antimetas (sería un fracaso aunque "funcione")

- Que en el celular el tap se sienta con retraso, haga zoom o desplace la página.
- Que se vea genérico o "de plantilla" en lugar de mexicano, festivo y de cómic.
- Que el día del concurso falle por depender de la red para las imágenes.

## Reglas del juego

- **Golpes requeridos:** `golpes(n) = 15 + 6·(n−1)`. Nivel 1 = 15, nivel 5 = 39, nivel 10 = 69 (unos 7 taps/s, cerca del límite de una persona, lo que separa bien a los jugadores). *Decisión de Claude; ajustable.*
- **Tiempo:** 10 s por nivel. Antes de cada nivel hay una cuenta "3, 2, 1, ¡Dale!" y el reloj arranca al terminarla.
- **Romper la piñata:** sumas puntos y pasas al siguiente nivel. **Si se acaba el tiempo:** termina la partida.
- **Puntos por nivel superado:** `100·n + round(segundosSobrantes·50)`.
- **Ranking (A + C, decidido por el usuario):** se ordena por **nivel máximo superado** (de mayor a menor) y el desempate es por **puntos totales**. Se muestran ambos valores.
- Cualquier tap o click en el área de juego cuenta como golpe. Se ignoran entradas a más de ~20/s como freno básico a autoclickers. *Decisión de Claude.*

## Enfoques considerados

1. **React + SVG + GSAP** (elegido; el usuario pidió "la mejor opción"). Piñatas y palo como SVG de cómic animados con GSAP (balanceo, sacudida, swing del palo, explosión de dulces). Se ve nítido en cualquier pantalla, es ligero y encaja con el stack actual.
2. **React + canvas o three.js.** Da control total de física y partículas, pero agrega peso y complejidad para un arte plano. Solo valdría la pena con volumen o física real, y no se busca ninguna de las dos.
3. **Motor de juegos (Phaser).** Demasiado pesado para una sola escena y choca con React.

## Stack

- Vite + React 19 (ya en el proyecto). Interfaz en español.
- **Tailwind 4**: conectar `@tailwindcss/vite` (hoy está instalado pero no se aplica).
- **GSAP** para animaciones.
- **Amplify Gen2** (Amplify Data) para la tabla de puntajes, con el perfil de AWS **`student-cd`** (región `us-east-1`).
- **Amplify Hosting** para publicar (frontend y backend en el mismo app de Amplify).
- Tipografías: una de cómic para títulos (*Bangers*) y una redondeada para texto (*Nunito*), autoalojadas con Fontsource.

## Pantallas y flujo

Todo se maneja como **modales** sobre la escena del juego:

1. **Inicio:** título, botón "¡Jugar!", top 10 y botón de sonido.
2. **Juego:** barra superior con el tiempo restante (número grande + barra que se vacía y se pone roja en los últimos 3 s), nivel actual y contador de golpes `x / requeridos`. Al centro, la piñata colgando de una cuerda y, al lado, el palo.
3. **Nivel superado:** explosión de dulces y confeti, puntos ganados, "Siguiente nivel".
4. **Fin de partida:** nivel alcanzado, puntos, campo de nombre (máx. 20 caracteres), "Guardar" y luego la tabla con tu posición resaltada. También "Jugar otra vez".

## Arte

- **Paleta posada/Navidad:** rosa mexicano `#E4007C`, naranja `#FF7A00`, amarillo cempasúchil `#FFC20E`, verde navideño `#0B8A3E`, rojo `#D7263D`, morado `#6A2C91`, turquesa `#00A6A6`, y tinta negra para contornos.
- **Estilo cómic:** contorno negro grueso, colores planos con sombra de trama, líneas de impacto y onomatopeyas ("¡PUM!", "¡ZAS!", "¡CRACK!") en cada golpe.
- **Piñatas (5 diseños que rotan por nivel; a partir del 6 se repiten con otra paleta):** estrella clásica de 7 picos, burrito, estrella dorada con flecos, piñata de olla y Santa. Daño visual en 3 etapas: grietas → pedazos faltantes → rota.
- **Palo:** palo de madera en SVG con vetas, envuelto en papel de colores. Gira desde abajo, en el lado derecho, hacia la piñata en cada tap. La piñata se sacude y se mueve hacia el otro lado.
- **Banda de papel picado** decorativa en la parte superior.
- **Fondos:** 5 fotos de Unsplash de barrios, vecindades y calles mexicanas, descargadas a `public/backgrounds/` y optimizadas (WebP, ~1600 px). Llevan un velo de color cálido para que resalte la piñata y un crédito discreto al fotógrafo.
- **Sonido:** efectos generados con Web Audio (golpe, ruptura, tic-tac en los últimos 3 s) y botón para silenciar. *Decisión de Claude.*

## Móvil

- `touch-action: none` en el área de juego, sin zoom por doble tap y sin selección de texto. La entrada se maneja con `pointerdown` para que no haya retraso.
- Diseño principal en vertical. En horizontal y en escritorio, la escena se centra.

## Tabla de puntajes (Amplify Gen2)

- Modelo `Score`: `name` (string, 1–20 caracteres), `level` (int), `points` (int) y `createdAt` automático.
- Autorización: `allow.publicApiKey()` para crear y leer. No hay edición ni borrado desde el cliente.
- Lectura: traer los puntajes y ordenarlos en el cliente con el criterio A + C (con pocos jugadores alcanza). Se muestra el top 10.
- Validación en el cliente (nombre recortado y sin vacíos, valores enteros ≥ 0). Si no hay red, se avisa y se puede reintentar.
- Desarrollo local con `npx ampx sandbox --profile student-cd`.

## Decisiones que quedan al implementador

- Trazos exactos de cada piñata, curvas de easing y duraciones.
- Selección concreta de las fotos de Unsplash dentro del tema.
- Estructura de componentes y archivos.
