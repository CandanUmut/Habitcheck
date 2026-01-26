export type Status = 'green' | 'yellow' | 'red'

export type Entry = {
  date: string
  status: Status
  note?: string
  updatedAt: number
}

export type Settings = {
  goalName: string
  dailyQuestionEnabled: boolean
  dailyQuestionText: string
  soundsEnabled: boolean
  theme: 'light' | 'dark'
  reminderTime: string
}
