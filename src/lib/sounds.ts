import { Status } from './types'

const playTone = (frequency: number, duration = 0.2, volume = 0.05) => {
  if (typeof window === 'undefined') return
  const AudioContext = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext
  if (!AudioContext) return
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = frequency
  oscillator.type = 'sine'
  gain.gain.value = volume
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
  oscillator.onended = () => {
    context.close()
  }
}

export const playStatusSound = (status: Status): void => {
  if (status === 'green') {
    playTone(660, 0.18, 0.06)
    return
  }
  if (status === 'yellow') {
    playTone(440, 0.2, 0.05)
    return
  }
  playTone(220, 0.25, 0.05)
}
