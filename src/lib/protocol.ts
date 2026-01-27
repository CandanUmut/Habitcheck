import { formatDate, lastNDays } from './dates'
import { ProtocolRun } from './types'

export type ProtocolStep = {
  id: string
  title: string
  caption: string
}

export const protocolSteps: ProtocolStep[] = [
  { id: 'stand', title: 'Stand up', caption: 'Break the freeze with a small change in posture.' },
  { id: 'wash', title: 'Wash face / quick reset', caption: 'A quick rinse can reset your nervous system.' },
  { id: 'water', title: 'Drink water', caption: 'Hydration helps you feel steadier and more present.' },
  { id: 'move-room', title: 'Change environment', caption: 'Step away from the trigger or device for a moment.' },
  { id: 'walk', title: 'Go outside for a walk', caption: 'Fresh air and movement shift momentum.' },
  { id: 'breathe', title: 'Breathe 60 seconds', caption: 'Slow, steady breaths. Inhale 4, exhale 6.' },
  { id: 'lock', title: 'Lock your device', caption: 'Use airplane mode, a lockbox, or a focus mode.' },
  { id: 'replace', title: 'Small replacement action', caption: 'Read 1 page, stretch 2 minutes, or message a friend.' }
]

const generateRunId = (): string => `protocol-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createProtocolRun = (trackerId: string, durationMinutes = 10, startedAt = Date.now()): ProtocolRun => ({
  id: generateRunId(),
  trackerId,
  date: formatDate(new Date(startedAt)),
  startedAt,
  completedSteps: 0,
  durationMinutes
})

export const completeProtocolRun = (
  run: ProtocolRun,
  completedSteps: number,
  completedAt = Date.now()
): ProtocolRun => ({
  ...run,
  completedAt,
  completedSteps
})

export const getProtocolRunsInRange = (
  runs: ProtocolRun[],
  trackerId: string,
  days: number,
  today: Date = new Date()
): ProtocolRun[] => {
  const range = new Set(lastNDays(days, today).map((date) => formatDate(date)))
  return runs.filter((run) => run.trackerId === trackerId && range.has(run.date))
}

export const getCompletedProtocolRunsInRange = (
  runs: ProtocolRun[],
  trackerId: string,
  days: number,
  today: Date = new Date()
): ProtocolRun[] => getProtocolRunsInRange(runs, trackerId, days, today).filter((run) => run.completedAt)
