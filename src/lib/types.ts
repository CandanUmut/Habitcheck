export type Status = 'green' | 'yellow' | 'red'

export type GoalMode = 'consistency' | 'green' | 'points'

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
  goalMode: GoalMode
  weeklyTarget: number
  monthlyTarget: number
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

export type Badge = {
  id: string
  title: string
  description: string
  icon: string
  earnedAt: string
}

export type BadgesState = {
  global: Badge[]
  trackers: Record<string, Badge[]>
}

export type AppData = {
  version: 4
  settings: AppSettings
  trackers: Tracker[]
  entries: Record<string, Entry[]>
  activeTrackerId?: string
  protocolRuns: ProtocolRun[]
  badges: BadgesState
}
