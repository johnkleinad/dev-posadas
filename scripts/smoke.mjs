// Prueba de humo: node scripts/smoke.mjs <url>
// Clásico: modos → Clásico → nivel 1 → nivel 2 → fin de partida (sin guardar puntaje).
// Fiesta: "Menú" → "← Modos" → Fiesta → nivel 1 → tiendita visible (sin comprar).
// En iPhone 13, Pixel 7 y escritorio. Sale con código 1 si algo falla.
// Usa PW_CHROME=<ruta a chrome> si el navegador de Playwright no está instalado.
import { chromium, devices } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:4173/'
const targets = [
  ['iPhone 13', devices['iPhone 13']],
  ['Pixel 7', devices['Pixel 7']],
  ['Escritorio', { viewport: { width: 1280, height: 800 } }],
]

const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || undefined })
const failures = []

for (const [name, device] of targets) {
  const ctx = await browser.newContext(device)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const fail = (msg) => failures.push(`[${name}] ${msg}`)
  const phase = () => page.getAttribute('[data-phase]', 'data-phase')
  const waitPhase = (p, timeout) =>
    page.waitForFunction((want) => document.querySelector('[data-phase]')?.dataset.phase === want, p, { timeout })
  const tapScene = async () => {
    const vp = page.viewportSize()
    if (device.hasTouch) await page.touchscreen.tap(vp.width * 0.4, vp.height * 0.55)
    else await page.mouse.click(vp.width * 0.4, vp.height * 0.55)
  }

  try {
    const breakPinata = async () => {
      for (let i = 0; i < 15; i++) {
        await tapScene()
        await page.waitForTimeout(60)
      }
      await waitPhase('levelCleared', 2000)
    }

    await page.goto(url)
    await page.getByRole('button', { name: /Clásico/ }).click()
    await page.getByRole('button', { name: '¡Jugar!' }).click()
    await waitPhase('playing', 6000)
    await breakPinata()
    if (await page.getByText('Tiendita').count()) fail('el Clásico no debe tener tiendita')

    const vp = page.viewportSize()
    for (const sel of ['[data-testid="time-left"]', 'svg[aria-label="Piñata"]']) {
      const box = await page.locator(sel).first().boundingBox()
      if (!box || box.y < 0 || box.x < 0 || box.x + box.width > vp.width || box.y > vp.height) {
        fail(`${sel} fuera del viewport: ${JSON.stringify(box)}`)
      }
    }

    await page.getByRole('button', { name: 'Siguiente nivel' }).click()
    await waitPhase('playing', 6000)
    await waitPhase('gameOver', 12000)
    await page.getByRole('button', { name: 'Guardar' }).waitFor({ timeout: 3000 })

    const m = await page.evaluate(() => ({ scrollY: window.scrollY, scale: window.visualViewport?.scale ?? 1 }))
    if (m.scrollY !== 0) fail(`la página hizo scroll (${m.scrollY})`)
    if (m.scale !== 1) fail(`la página hizo zoom (${m.scale})`)

    // Fiesta: volver al menú del modo, cambiar a Fiesta y llegar a la tiendita.
    await page.getByRole('button', { name: 'Menú' }).click()
    await page.getByRole('button', { name: '← Modos' }).click()
    await page.getByRole('button', { name: /Fiesta/ }).click()
    await page.getByRole('heading', { name: 'Modo Fiesta' }).waitFor({ timeout: 3000 })
    await page.getByRole('button', { name: '¡Jugar!' }).click()
    await waitPhase('playing', 6000)
    await breakPinata()
    await page.getByText('Tiendita').waitFor({ timeout: 3000 })
    await page.getByRole('button', { name: 'Siguiente nivel' }).waitFor({ timeout: 3000 })
  } catch (e) {
    fail(`flujo interrumpido en fase "${await phase().catch(() => '?')}": ${e.message.split('\n')[0]}`)
  }
  if (errors.length) fail(`errores en consola: ${errors.join(' | ')}`)
  await ctx.close()
  console.log(`${failures.some((f) => f.startsWith(`[${name}]`)) ? '✗' : '✓'} ${name}`)
}

await browser.close()
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Prueba de humo OK')
