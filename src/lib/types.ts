export type Status = 'green' | 'yellow' | 'red'

export type Entry = {
  date: string
  status: Status
  note?: string
  updatedAt: number
}

export type Tracker = {
  id: string
  name: string
  dailyQuestionEnabled: boolean
  dailyQuestionText: string
}

export type ProtocolRun = {
  id: string
  trackerId: string
  date: string
  startedAt: number
  completedAt?: number
  completedSteps: number
  durationMinutes: number
}

export type AppSettings = {
  soundsEnabled: boolean
  theme: 'light' | 'dark'
  hapticsEnabled: boolean
}

export type AppData = {
  version: 3
  settings: AppSettings
  trackers: Tracker[]
  entries: Record<string, Entry[]>
  activeTrackerId?: string
  protocolRuns: ProtocolRun[]
}
