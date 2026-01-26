import { Entry, Status } from './types'
import { formatDate, lastNDays, parseDate } from './date'

export const GREEN_POINTS = 3
export const YELLOW_POINTS = 1
export const RED_POINTS = 0
export const CHAIN_BONUS_PER_DAY = 0.2
export const CHAIN_BONUS_CAP = 3

export type SummaryCounts = {
  green: number
  yellow: number
  red: number
}

export type TrackerStats = {
  last7: SummaryCounts
  last30: SummaryCounts
  loggedLast30: number
  currentGreenStreak: number
  bestGreenStreak: number
  loggingStreak: number
  bestGreenStreakEver: number
  bestLoggingStreak: number
  momentumScore: number
}

const statusPoints = (status: Status): number => {
  if (status === 'green') return GREEN_POINTS
  if (status === 'yellow') return YELLOW_POINTS
  return RED_POINTS
}

const initCounts = (): SummaryCounts => ({ green: 0, yellow: 0, red: 0 })

const sortEntries = (entries: Entry[]): Entry[] =>
  [...entries].sort((a, b) => a.date.localeCompare(b.date))

const mapEntries = (entries: Entry[]): Map<string, Entry> =>
  new Map(entries.map((entry) => [entry.date, entry]))

export const calculateStats = (entries: Entry[], today = new Date()): TrackerStats => {
  const entryMap = mapEntries(entries)
  const last7 = initCounts()
  const last30 = initCounts()
  let loggedLast30 = 0
  let momentumScore = 0

  const last7Days = lastNDays(7, today)
  const last30Days = lastNDays(30, today)

  last7Days.forEach((day) => {
    const entry = entryMap.get(formatDate(day))
    if (!entry) return
    last7[entry.status] += 1
  })

  let greenChain = 0
  last30Days.forEach((day) => {
    const entry = entryMap.get(formatDate(day))
    if (!entry) {
      greenChain = 0
      return
    }
    loggedLast30 += 1
    last30[entry.status] += 1
    if (entry.status === 'green') {
      greenChain += 1
      const chainBonus = Math.min(greenChain * CHAIN_BONUS_PER_DAY, CHAIN_BONUS_CAP)
      momentumScore += statusPoints(entry.status) + chainBonus
    } else {
      greenChain = 0
      momentumScore += statusPoints(entry.status)
    }
  })

  const sorted = sortEntries(entries)
  let bestGreenStreak = 0
  let bestLoggingStreak = 0
  let currentGreenStreak = 0
  let currentLoggingStreak = 0

  let prevDate: Date | null = null
  let greenStreak = 0
  let loggingStreak = 0

  sorted.forEach((entry) => {
    const entryDate = parseDate(entry.date)
    if (prevDate) {
      const expectedNext = new Date(prevDate)
      expectedNext.setDate(expectedNext.getDate() + 1)
      const isNextDay = entryDate.toDateString() === expectedNext.toDateString()
      if (!isNextDay) {
        greenStreak = 0
        loggingStreak = 0
      }
    }

    loggingStreak += 1
    if (entry.status === 'green') {
      greenStreak += 1
    } else {
      greenStreak = 0
    }

    bestGreenStreak = Math.max(bestGreenStreak, greenStreak)
    bestLoggingStreak = Math.max(bestLoggingStreak, loggingStreak)
    prevDate = entryDate
  })

  const todayEntry = entryMap.get(formatDate(today))
  if (todayEntry) {
    currentLoggingStreak = 1
    currentGreenStreak = todayEntry.status === 'green' ? 1 : 0
    let greenActive = currentGreenStreak > 0
    let cursor = new Date(today)
    while (true) {
      cursor.setDate(cursor.getDate() - 1)
      const entry = entryMap.get(formatDate(cursor))
      if (!entry) break
      currentLoggingStreak += 1
      if (greenActive) {
        if (entry.status === 'green') {
          currentGreenStreak += 1
        } else {
          greenActive = false
        }
      }
    }
  }

  return {
    last7,
    last30,
    loggedLast30,
    currentGreenStreak,
    bestGreenStreak,
    loggingStreak: currentLoggingStreak,
    bestGreenStreakEver: bestGreenStreak,
    bestLoggingStreak,
    momentumScore: Number(momentumScore.toFixed(1))
  }
}
