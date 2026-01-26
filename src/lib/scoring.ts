import { Entry, Status } from './types'
import { formatDate, lastNDays, parseDate } from './dates'

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
  loggedLast7: number
  loggedLast30: number
  currentGreenStreak: number
  bestGreenStreak: number
  loggingStreak: number
  bestLoggingStreak: number
  momentumWeekly: number
  momentumMonthly: number
  consistencyWeekly: number
  consistencyMonthly: number
  dailyScores: number[]
}

const statusPoints = (status: Status): number => {
  if (status === 'green') return GREEN_POINTS
  if (status === 'yellow') return YELLOW_POINTS
  return RED_POINTS
}

const initCounts = (): SummaryCounts => ({ green: 0, yellow: 0, red: 0 })

const mapEntries = (entries: Entry[]): Map<string, Entry> =>
  new Map(entries.map((entry) => [entry.date, entry]))

const calculateRangeScore = (entries: Map<string, Entry>, days: Date[]) => {
  const counts = initCounts()
  let logged = 0
  let totalScore = 0
  let greenChain = 0

  days.forEach((day) => {
    const entry = entries.get(formatDate(day))
    if (!entry) {
      greenChain = 0
      return
    }
    logged += 1
    counts[entry.status] += 1
    if (entry.status === 'green') {
      greenChain += 1
      const chainBonus = Math.min(greenChain * CHAIN_BONUS_PER_DAY, CHAIN_BONUS_CAP)
      totalScore += statusPoints(entry.status) + chainBonus
    } else {
      greenChain = 0
      totalScore += statusPoints(entry.status)
    }
  })

  return { counts, logged, totalScore: Number(totalScore.toFixed(1)) }
}

const calculateStreaks = (entries: Entry[], today: Date) => {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let bestGreenStreak = 0
  let bestLoggingStreak = 0
  let greenStreak = 0
  let loggingStreak = 0
  let prevDate: Date | null = null

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

  const entryMap = mapEntries(entries)
  const todayEntry = entryMap.get(formatDate(today))
  let currentLoggingStreak = 0
  let currentGreenStreak = 0
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
    bestGreenStreak,
    bestLoggingStreak,
    currentGreenStreak,
    currentLoggingStreak
  }
}

export const calculateDailyScores = (entries: Entry[], days: number, today = new Date()): number[] => {
  const entryMap = mapEntries(entries)
  const range = lastNDays(days, today)
  let greenChain = 0
  return range.map((day) => {
    const entry = entryMap.get(formatDate(day))
    if (!entry) {
      greenChain = 0
      return 0
    }
    if (entry.status === 'green') {
      greenChain += 1
      const chainBonus = Math.min(greenChain * CHAIN_BONUS_PER_DAY, CHAIN_BONUS_CAP)
      return Number((statusPoints(entry.status) + chainBonus).toFixed(1))
    }
    greenChain = 0
    return statusPoints(entry.status)
  })
}

export const calculateStats = (entries: Entry[], today = new Date()): TrackerStats => {
  const entryMap = mapEntries(entries)
  const last7Days = lastNDays(7, today)
  const last30Days = lastNDays(30, today)

  const last7Score = calculateRangeScore(entryMap, last7Days)
  const last30Score = calculateRangeScore(entryMap, last30Days)

  const streaks = calculateStreaks(entries, today)

  const consistencyWeekly = last7Days.length === 0 ? 0 : Math.round((last7Score.logged / 7) * 100)
  const consistencyMonthly = last30Days.length === 0 ? 0 : Math.round((last30Score.logged / 30) * 100)

  return {
    last7: last7Score.counts,
    last30: last30Score.counts,
    loggedLast7: last7Score.logged,
    loggedLast30: last30Score.logged,
    currentGreenStreak: streaks.currentGreenStreak,
    bestGreenStreak: streaks.bestGreenStreak,
    loggingStreak: streaks.currentLoggingStreak,
    bestLoggingStreak: streaks.bestLoggingStreak,
    momentumWeekly: last7Score.totalScore,
    momentumMonthly: last30Score.totalScore,
    consistencyWeekly,
    consistencyMonthly,
    dailyScores: calculateDailyScores(entries, 30, today)
  }
}
