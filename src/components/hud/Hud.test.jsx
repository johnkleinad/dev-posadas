// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Hud from './Hud.jsx'

afterEach(cleanup)
const bar = () => screen.getByTestId('time-bar').style.width

describe('Hud', () => {
  it('la barra se llena según la duración del nivel', () => {
    render(<Hud timeLeft={12} levelSeconds={12} level={2} hits={0} required={21} />)
    expect(bar()).toBe('100%')
    cleanup()
    render(<Hud timeLeft={6} levelSeconds={12} level={2} hits={0} required={21} />)
    expect(bar()).toBe('50%')
  })

  it('nunca pasa del 100 %', () => {
    render(<Hud timeLeft={12} levelSeconds={10} level={1} hits={0} required={15} />)
    expect(bar()).toBe('100%')
  })

  it('muestra la chapita del power-up activo', () => {
    render(<Hud timeLeft={5} levelSeconds={10} level={2} hits={0} required={21} activePowerUp="tamarindo" />)
    expect(screen.getByText(/Dulce de tamarindo/)).toBeTruthy()
  })
})
