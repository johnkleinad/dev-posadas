// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Modal from './Modal.jsx'

afterEach(cleanup)

describe('Modal', () => {
  it('no deja tocar sus botones mientras sigue invisible y sí al terminar de aparecer', async () => {
    render(
      <Modal title="Prueba" delay={0.1}>
        <button type="button">Otra vez</button>
      </Modal>,
    )
    const card = screen.getByTestId('modal-card')
    expect(card.style.pointerEvents).toBe('none')
    await waitFor(() => expect(card.style.pointerEvents).toBe('auto'), { timeout: 3000 })
  })
})
