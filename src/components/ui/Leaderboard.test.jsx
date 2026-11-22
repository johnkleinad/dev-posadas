// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Leaderboard from './Leaderboard.jsx'

afterEach(cleanup)

describe('Leaderboard', () => {
  it('la columna de dulces no tiene ancho fijo ni se parte en dos líneas', () => {
    render(<Leaderboard status="ok" scores={[{ id: '1', name: 'Vero', level: 30, points: 123456 }]} />)
    const cell = screen.getByText('123456').closest('span')
    expect(cell.className).toContain('whitespace-nowrap')
    expect(cell.className).not.toMatch(/\bw-\d+/)
  })
})
