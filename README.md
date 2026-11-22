# ¡Dale, Dale! — Piñatas mexicanas

Juego web de piñatas para posadas: rompe la piñata a puro tap (o clic) antes de que se acaben los **10 segundos**. Cada nivel trae una piñata nueva que aguanta más golpes, sobre fotos de barrios y calles mexicanas.

**Jugar:** https://main.d1d7zmugu9x1aq.amplifyapp.com

## Modos

- **Clásico:** rompe piñatas contra el reloj, nivel tras nivel.
- **Fiesta** (próximamente: sale deshabilitado en el menú con `comingSoon` en `src/game/modes.js`)**:** igual, pero entre niveles hay una **tiendita**. Ahí gastas tus dulces en un power-up para el siguiente nivel (uno por nivel, no se acumula). El precio es `base × nivel`.

| Power-up | Efecto | Base |
|---|---|---|
| Velita | +2 s en el nivel | 40 |
| Escarcha | Congela el reloj 2 s cuando quedan 2 s | 40 |
| Luces de bengala | Golpe triple en los últimos 3 s | 50 |
| Ponche | 25 % menos golpes | 60 |
| Dulce de tamarindo | Cada golpe cuenta doble | 90 |
| Pedir posada | Si se acaba el tiempo, repites el nivel | 120 |

Cada modo tiene su propia tabla de campeones. Los modos viven en `src/game/modes.js` y los power-ups en `src/game/powerups.js`. Un modo nuevo es una entrada más; un power-up nuevo es una combinación de efectos que ya existen.

## Reglas

- Golpes por nivel: `15 + 6·(nivel − 1)` (15, 21, 27…).
- Dulces por nivel superado: `100·nivel + 50 × segundos sobrantes` (con la Escarcha cuenta lo que marca el reloj).
- Tabla de campeones (por modo): primero niveles superados, luego dulces juntados en total.

## Desarrollo

Requisitos: Node 22 y credenciales de AWS con el perfil `student-cd`.

```bash
npm install
# Backend personal (genera amplify_outputs.json, necesario para compilar)
AWS_PROFILE=student-cd AWS_REGION=us-east-1 npx ampx sandbox --once
npm run dev          # http://localhost:5173  (galería de piñatas: /?gallery)
npm test             # pruebas de lógica (Vitest)
npm run build && npm run preview
npm run smoke -- http://localhost:4173/   # prueba de humo en iPhone, Pixel y escritorio
```

Si Playwright no encuentra su navegador, instala uno con `npx playwright install chromium` o indica la ruta en `PW_CHROME`.

## Stack

Vite + React 19, Tailwind 4, GSAP (animaciones), SVG para el arte de cómic, Web Audio para los sonidos y Amplify Gen2 (Amplify Data con API key) para la tabla de puntajes. Se despliega en Amplify Hosting desde la rama `main` (`amplify.yml`).

## Créditos de fotos

Fondos de [Unsplash](https://unsplash.com) (Unsplash License): Megumi SUGIYAMA, Roger Ce, Alfonso Navarro, Ocean Wahl y ayumi kubo. Ver `src/game/backgrounds.js`.
