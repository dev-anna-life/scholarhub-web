/**
 * ScholarHub Audio Notification System
 * Uses Web Audio API for zero-latency, reliable, 100% offline harmonic sound effects
 */

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Ensure audio context is resumed on user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    getAudioContext()
    window.removeEventListener('click', unlockAudio)
    window.removeEventListener('touchstart', unlockAudio)
  }
  window.addEventListener('click', unlockAudio, { passive: true })
  window.addEventListener('touchstart', unlockAudio, { passive: true })
}

export function isSoundEnabled() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('scholarhub_sound_enabled') !== 'false'
}

export function playNotificationSound(type = 'notification') {
  if (!isSoundEnabled()) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'message') {
      // Sleek bubble pop tone (TikTok / iOS style)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.16)

    } else if (type === 'gift') {
      // Sparkling ascending chord for coins & gifts
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteTime = now + (i * 0.06)

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, noteTime)

        gain.gain.setValueAtTime(0.25, noteTime)
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteTime)
        osc.stop(noteTime + 0.26)
      })

    } else {
      // Default notification chime: uplifting two-tone glass chime (D5 -> A5)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, now) // D5
      gain1.gain.setValueAtTime(0.25, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.29)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      const secondNoteTime = now + 0.09
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, secondNoteTime) // A5
      gain2.gain.setValueAtTime(0.3, secondNoteTime)
      gain2.gain.exponentialRampToValueAtTime(0.001, secondNoteTime + 0.35)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(secondNoteTime)
      osc2.stop(secondNoteTime + 0.36)
    }
  } catch (err) {
    console.debug('Sound error:', err)
  }
}
