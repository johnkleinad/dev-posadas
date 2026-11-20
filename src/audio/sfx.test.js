import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSfx } from './sfx.js'

afterEach(() => {
  delete globalThis.window
})

function fakeAudioContext(state) {
  const resume = vi.fn(() => Promise.resolve())
  class FakeAC {
    constructor() {
      this.state = state
      this.resume = resume
    }
  }
  globalThis.window = { AudioContext: FakeAC }
  return resume
}

describe('createSfx.unlock', () => {
  it('reanuda el audio cuando iOS lo deja "interrupted" tras bloquear el teléfono', () => {
    const resume = fakeAudioContext('interrupted')
    createSfx().unlock()
    expect(resume).toHaveBeenCalled()
  })
  it('no falla si resume() es rechazado', async () => {
    const resume = fakeAudioContext('suspended')
    resume.mockImplementation(() => Promise.reject(new Error('no gesture')))
    expect(() => createSfx().unlock()).not.toThrow()
    await Promise.resolve()
  })
})
