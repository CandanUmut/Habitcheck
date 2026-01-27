import { AppData, AppSettings, Entry, ProtocolRun, Tracker } from './types'

const STORAGE_KEY = 'tracker.v3.data'
const LEGACY_V2_KEY = 'tracker.v2.data'
const LEGACY_SETTINGS_KEY = 'tracker.v1.settings'
const LEGACY_ENTRIES_KEY = 'tracker.v1.entries'
const ONBOARDING_KEY = 'tracker.onboardingCompleted'

const defaultSettings: AppSettings = {
  soundsEnabled: true,
  theme: 'light',
  hapticsEnabled: true
}

const defaultTrackerQuestion = 'What made today easier or harder?'

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `tracker-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const ensureSettings = (input: Partial<AppSettings> | null): AppSettings => {
  if (!input) return { ...defaultSettings }
  return {
    ...defaultSettings,
    ...input,
    theme: input.theme === 'dark' ? 'dark' : 'light',
    soundsEnabled: input.soundsEnabled !== false,
    hapticsEnabled: input.hapticsEnabled !== false
  }
}

const ensureTracker = (input: Partial<Tracker> | null): Tracker | null => {
  if (!input || typeof input.name !== 'string') return null
  return {
    id: typeof input.id === 'string' ? input.id : generateId(),
    name: input.name.trim() || 'My goal',
    dailyQuestionEnabled: Boolean(input.dailyQuestionEnabled),
    dailyQuestionText:
      typeof input.dailyQuestionText === 'string' && input.dailyQuestionText.trim()
        ? input.dailyQuestionText.trim()
        : defaultTrackerQuestion
  }
}

const ensureTrackers = (input: Tracker[] | null): Tracker[] => {
  if (!Array.isArray(input)) return []
  return input.map((tracker) => ensureTracker(tracker)).filter((tracker): tracker is Tracker => Boolean(tracker))
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

const ensureEntriesMap = (input: Record<string, Entry[]> | null): Record<string, Entry[]> => {
  if (!input || typeof input !== 'object') return {}
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, ensureEntries(value)])
  )
}

const ensureProtocolRuns = (input: ProtocolRun[] | null): ProtocolRun[] => {
  if (!Array.isArray(input)) return []
  return input
    .filter((run) => run && typeof run.trackerId === 'string' && typeof run.startedAt === 'number')
    .map((run) => ({
      id: typeof run.id === 'string' ? run.id : generateId(),
      trackerId: run.trackerId,
      date: typeof run.date === 'string' ? run.date : new Date(run.startedAt).toISOString().slice(0, 10),
      startedAt: run.startedAt,
      completedAt: typeof run.completedAt === 'number' ? run.completedAt : undefined,
      completedSteps: typeof run.completedSteps === 'number' ? run.completedSteps : 0,
      durationMinutes: typeof run.durationMinutes === 'number' ? run.durationMinutes : 10
    }))
}

const migrateLegacyData = (): AppData => {
  const legacySettings = safeJsonParse<{
    goalName?: string
    dailyQuestionEnabled?: boolean
    dailyQuestionText?: string
    soundsEnabled?: boolean
    theme?: 'light' | 'dark'
  }>(localStorage.getItem(LEGACY_SETTINGS_KEY))
  const legacyEntries = safeJsonParse<Entry[]>(localStorage.getItem(LEGACY_ENTRIES_KEY))
  const trackerName = legacySettings?.goalName?.trim() ?? ''

  if (!trackerName && (!legacyEntries || legacyEntries.length === 0)) {
    return {
      version: 3,
      settings: ensureSettings({ soundsEnabled: legacySettings?.soundsEnabled, theme: legacySettings?.theme }),
      trackers: [],
      entries: {},
      activeTrackerId: undefined,
      protocolRuns: []
    }
  }

  const tracker: Tracker = {
    id: generateId(),
    name: trackerName || 'My goal',
    dailyQuestionEnabled: Boolean(legacySettings?.dailyQuestionEnabled),
    dailyQuestionText:
      legacySettings?.dailyQuestionText?.trim() || defaultTrackerQuestion
  }

  return {
    version: 3,
    settings: ensureSettings({ soundsEnabled: legacySettings?.soundsEnabled, theme: legacySettings?.theme }),
    trackers: [tracker],
    entries: {
      [tracker.id]: ensureEntries(legacyEntries ?? null)
    },
    activeTrackerId: tracker.id,
    protocolRuns: []
  }
}

const ensureAppData = (input: AppData | null): AppData => {
  if (!input) return migrateLegacyData()
  if (input.version === 2) {
    return {
      version: 3,
      settings: ensureSettings(input.settings ?? null),
      trackers: ensureTrackers(input.trackers ?? []),
      entries: ensureEntriesMap(input.entries ?? {}),
      activeTrackerId:
        typeof input.activeTrackerId === 'string' ? input.activeTrackerId : input.trackers?.[0]?.id,
      protocolRuns: []
    }
  }
  if (input.version !== 3) return migrateLegacyData()
  const trackers = ensureTrackers(input.trackers ?? [])
  const entries = ensureEntriesMap(input.entries ?? {})
  const activeTrackerId = typeof input.activeTrackerId === 'string' ? input.activeTrackerId : trackers[0]?.id
  return {
    version: 3,
    settings: ensureSettings(input.settings ?? null),
    trackers,
    entries,
    activeTrackerId,
    protocolRuns: ensureProtocolRuns(input.protocolRuns ?? null)
  }
}

export const loadAppData = (): AppData => {
  if (typeof window === 'undefined') {
    return {
      version: 3,
      settings: { ...defaultSettings },
      trackers: [],
      entries: {},
      activeTrackerId: undefined,
      protocolRuns: []
    }
  }
  const raw = safeJsonParse<AppData>(localStorage.getItem(STORAGE_KEY))
  if (raw) return ensureAppData(raw)
  const legacyRaw = safeJsonParse<AppData>(localStorage.getItem(LEGACY_V2_KEY))
  return ensureAppData(legacyRaw)
}

export const saveAppData = (data: AppData): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const exportData = (): AppData => loadAppData()

export const importData = (payload: AppData): AppData => {
  const sanitized = ensureAppData(payload)
  saveAppData(sanitized)
  return sanitized
}

export const resetData = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LEGACY_V2_KEY)
}

export const createTracker = (name: string): Tracker => ({
  id: generateId(),
  name: name.trim() || 'My goal',
  dailyQuestionEnabled: false,
  dailyQuestionText: defaultTrackerQuestion
})

export const isOnboardingComplete = (): boolean => {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export const setOnboardingComplete = (value: boolean): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_KEY, String(value))
}

export { defaultSettings, STORAGE_KEY }
