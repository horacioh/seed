// Synthesized audio for tutorials: one subtle UI click per real click, nothing else (no music bed,
// no typing ticks, no caption pops). Generated in code so no licensed assets are needed.
// Writes a 48 kHz 16-bit stereo WAV.
import fs from 'node:fs'

export const SR = 48000

function env(t, a, d) {
  return t < a ? t / a : Math.exp(-(t - a) / d)
}
function noise(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296 - 0.5
  }
}

// Soft mouse click: a short damped tick (down) and a quieter one ~70 ms later (up). Peaks around -14 dBFS.
export function click(buf, at, gain = 0.45) {
  const n0 = Math.floor(at * SR),
    rnd = noise(7)
  for (let i = 0; i < SR * 0.05; i++) {
    const t = i / SR
    const v =
      (Math.sin(2 * Math.PI * 1900 * t) * env(t, 0.0005, 0.006) * 0.6 + rnd() * env(t, 0.0003, 0.004) * 0.9) * gain
    const j = (n0 + i) * 2
    if (j + 1 < buf.length) {
      buf[j] += v
      buf[j + 1] += v
    }
  }
  const n1 = n0 + Math.floor(SR * 0.07)
  for (let i = 0; i < SR * 0.03; i++) {
    const t = i / SR
    const v =
      (Math.sin(2 * Math.PI * 1400 * t) * env(t, 0.0005, 0.005) * 0.35 + rnd() * env(t, 0.0003, 0.003) * 0.5) * gain
    const j = (n1 + i) * 2
    if (j + 1 < buf.length) {
      buf[j] += v
      buf[j + 1] += v
    }
  }
}

// events: [{ t: ms, kind }] — only `click` events make a sound.
export function renderAudio({durationMs, events, out}) {
  const seconds = durationMs / 1000 + 0.2
  const buf = new Float32Array(Math.ceil(seconds * SR) * 2)
  for (const e of events) if (e.kind === 'click') click(buf, e.t / 1000)
  for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(buf[i] * 1.2) * 0.85 // soft limiter
  writeWav(out, buf)
  return out
}

export function writeWav(file, f32) {
  const bytes = f32.length * 2
  const b = Buffer.alloc(44 + bytes)
  b.write('RIFF', 0)
  b.writeUInt32LE(36 + bytes, 4)
  b.write('WAVE', 8)
  b.write('fmt ', 12)
  b.writeUInt32LE(16, 16)
  b.writeUInt16LE(1, 20)
  b.writeUInt16LE(2, 22)
  b.writeUInt32LE(SR, 24)
  b.writeUInt32LE(SR * 4, 28)
  b.writeUInt16LE(4, 32)
  b.writeUInt16LE(16, 34)
  b.write('data', 36)
  b.writeUInt32LE(bytes, 40)
  for (let i = 0; i < f32.length; i++)
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767))), 44 + i * 2)
  fs.writeFileSync(file, b)
}

// CLI: node ops/video-kit/audio/mix.mjs out.wav  → 4 s demo with two clicks (for listening checks)
if (process.argv[1] && process.argv[1].endsWith('mix.mjs') && process.argv[2]) {
  renderAudio({
    durationMs: 4000,
    events: [
      {t: 1000, kind: 'click'},
      {t: 2500, kind: 'click'},
    ],
    out: process.argv[2],
  })
  console.log('wrote', process.argv[2])
}
