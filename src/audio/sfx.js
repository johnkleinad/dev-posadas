/**
 * Efectos de sonido sintetizados con Web Audio (sin archivos).
 * El AudioContext se crea/reanuda en el primer gesto del usuario (unlock()).
 */
export function createSfx() {
  let ctx = null
  let muted = false

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  function tone({ freq, to = freq, dur = 0.12, type = 'sine', gain = 0.3, delay = 0 }) {
    const a = !muted && audio()
    if (!a) return
    const t = a.currentTime + delay
    const osc = a.createOscillator()
    const g = a.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur)
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(g).connect(a.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  function noise({ dur = 0.08, freq = 1800, gain = 0.35, delay = 0 }) {
    const a = !muted && audio()
    if (!a) return
    const t = a.currentTime + delay
    const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = a.createBufferSource()
    src.buffer = buffer
    const filter = a.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    const g = a.createGain()
    g.gain.value = gain
    src.connect(filter).connect(g).connect(a.destination)
    src.start(t)
  }

  return {
    unlock: () => {
      if (!muted) audio()
    },
    setMuted: (value) => {
      muted = value
    },
    hit() {
      tone({ freq: 150 + Math.random() * 40, to: 55, dur: 0.14, type: 'triangle', gain: 0.5 })
      noise({ dur: 0.07, freq: 1200 + Math.random() * 800, gain: 0.4 })
    },
    break() {
      noise({ dur: 0.35, freq: 900, gain: 0.5 })
      ;[523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.18, type: 'square', gain: 0.12, delay: 0.08 + i * 0.09 }))
    },
    tick() {
      tone({ freq: 1100, dur: 0.06, type: 'square', gain: 0.12 })
    },
    countdown(final = false) {
      tone(final ? { freq: 880, to: 1320, dur: 0.35, type: 'square', gain: 0.15 } : { freq: 660, dur: 0.15, type: 'square', gain: 0.12 })
    },
    lose() {
      ;[392, 330, 262].forEach((f, i) => tone({ freq: f, dur: 0.25, type: 'triangle', gain: 0.25, delay: i * 0.18 }))
    },
  }
}
