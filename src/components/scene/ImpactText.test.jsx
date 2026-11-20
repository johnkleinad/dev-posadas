// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import gsap from 'gsap'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ImpactText from './ImpactText.jsx'

afterEach(cleanup)

describe('ImpactText', () => {
  it('no reinicia su animación cuando el padre re-renderiza con un onDone nuevo', () => {
    const spy = vi.spyOn(gsap, 'timeline')
    const { rerender } = render(<ImpactText x={10} y={10} text="¡PUM!" onDone={() => {}} />)
    rerender(<ImpactText x={10} y={10} text="¡PUM!" onDone={() => {}} />)
    rerender(<ImpactText x={10} y={10} text="¡PUM!" onDone={() => {}} />)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
