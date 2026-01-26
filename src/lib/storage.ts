import { Entry, Settings } from './types'

const SETTINGS_KEY = 'tracker.v1.settings'
const ENTRIES_KEY = 'tracker.v1.entries'

const defaultSettings: Settings = {
  goalName: '',
  dailyQuestionEnabled: false,
  dailyQuestionText: 'What made today easier or harder?',
  soundsEnabled: true,
  theme: 'light',
  reminderTime: ''
}

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const ensureSettings = (input: Partial<Settings> | null): Settings => {
  if (!input) return { ...defaultSettings }
  return {
    ...defaultSettings,
    ...input,
    theme: input.theme === 'dark' ? 'dark' : 'light',
    dailyQuestionEnabled: Boolean(input.dailyQuestionEnabled),
    soundsEnabled: input.soundsEnabled !== false,
    goalName: typeof input.goalName === 'string' ? input.goalName : '',
    reminderTime: typeof input.reminderTime === 'string' ? input.reminderTime : ''
  }
}

const ensureEntries = (input: Entry[] | null): Entry[] => {
  if (!Array.isArray(input)) return []
  return input
    .filter((entry) => entry && typeof entry.date === 'string' && typeof entry.status === 'string')
    .map((entry) => ({
      date: entry.date,
      status: entry.status === 'yellow' || entry.status === 'red' ? entry.status : 'green',
      note: typeof entry.note === 'string' ? entry.note : undefined,
      updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now()
    }))
}

export const loadSettings = (): Settings => {
  if (typeof window === 'undefined') return { ...defaultSettings }
  return ensureSettings(safeJsonParse<Settings>(localStorage.getItem(SETTINGS_KEY)))
}

export const saveSettings = (settings: Settings): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const loadEntries = (): Entry[] => {
  if (typeof window === 'undefined') return []
  return ensureEntries(safeJsonParse<Entry[]>(localStorage.getItem(ENTRIES_KEY)))
}

export const saveEntries = (entries: Entry[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export const exportData = (): { settings: Settings; entries: Entry[] } => ({
  settings: loadSettings(),
  entries: loadEntries()
})

export const importData = (payload: { settings?: Partial<Settings>; entries?: Entry[] }): {
  settings: Settings
  entries: Entry[]
} => {
  const settings = ensureSettings(payload.settings ?? null)
  const entries = ensureEntries(payload.entries ?? null)
  saveSettings(settings)
  saveEntries(entries)
  return { settings, entries }
}

export const resetData = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SETTINGS_KEY)
  localStorage.removeItem(ENTRIES_KEY)
}

export { SETTINGS_KEY, ENTRIES_KEY, defaultSettings }
