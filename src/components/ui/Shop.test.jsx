// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Shop from './Shop.jsx'

afterEach(cleanup)
const SHOP = ['velita', 'escarcha', 'tamarindo', 'bengala', 'ponche', 'posada']

describe('Shop', () => {
  it('deshabilita lo que no alcanzas con tus dulces', () => {
    render(<Shop shop={SHOP} level={2} wallet={100} selected={null} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /Velita/ }).disabled).toBe(false) // 80
    expect(screen.getByRole('button', { name: /tamarindo/ }).disabled).toBe(true) // 180
    expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && el.textContent === 'Tienes 100 dulces')).toBeTruthy()
  })

  it('elegir y volver a tocar la elegida la quita', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<Shop shop={SHOP} level={2} wallet={100} selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Velita/ }))
    expect(onSelect).toHaveBeenLastCalledWith('velita')
    rerender(<Shop shop={SHOP} level={2} wallet={100} selected="velita" onSelect={onSelect} />)
    expect(screen.getByRole('button', { name: /Velita/ }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /Velita/ }))
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })
})
