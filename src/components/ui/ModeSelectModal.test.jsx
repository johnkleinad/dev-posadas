// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ModeSelectModal from './ModeSelectModal.jsx'

afterEach(cleanup)

describe('ModeSelectModal', () => {
  it('muestra una tarjeta por modo y avisa cuál se eligió', async () => {
    const onPick = vi.fn()
    render(<ModeSelectModal onPick={onPick} muted={false} onToggleMute={() => {}} />)
    expect(screen.getByRole('button', { name: /Clásico/ })).toBeTruthy()
    const fiesta = screen.getByRole('button', { name: /Fiesta/ })
    await waitFor(() => expect(screen.getByTestId('modal-card').style.pointerEvents).toBe('auto'), { timeout: 3000 })
    fireEvent.click(fiesta)
    expect(onPick).toHaveBeenCalledWith('fiesta')
  })
})
