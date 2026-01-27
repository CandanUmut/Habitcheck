import { Entry, ProtocolRun, Status } from './types'
import { formatDate, lastNDays, parseDate } from './dates'

export const GREEN_POINTS = 3
export const YELLOW_POINTS = 1
export const RED_POINTS = 0
export const RECOVERY_POINTS = 1
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

const getRecoveryDates = (runs: ProtocolRun[]): Set<string> =>
  new Set(runs.filter((run) => run.completedAt).map((run) => run.date))

const calculateRangeScore = (entries: Map<string, Entry>, days: Date[], recoveryDates = new Set<string>()) => {
  const counts = initCounts()
  let logged = 0
  let totalScore = 0
  let greenChain = 0

  days.forEach((day) => {
    const dayKey = formatDate(day)
    const entry = entries.get(dayKey)
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
    if (recoveryDates.has(dayKey)) {
      totalScore += RECOVERY_POINTS
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

export const calculateDailyScores = (
  entries: Entry[],
  days: number,
  today = new Date(),
  protocolRuns: ProtocolRun[] = []
): number[] => {
  const entryMap = mapEntries(entries)
  const range = lastNDays(days, today)
  const recoveryDates = getRecoveryDates(protocolRuns)
  let greenChain = 0
  return range.map((day) => {
    const dayKey = formatDate(day)
    const entry = entryMap.get(dayKey)
    if (!entry) {
      greenChain = 0
      return 0
    }
    if (entry.status === 'green') {
      greenChain += 1
      const chainBonus = Math.min(greenChain * CHAIN_BONUS_PER_DAY, CHAIN_BONUS_CAP)
      const total = statusPoints(entry.status) + chainBonus + (recoveryDates.has(dayKey) ? RECOVERY_POINTS : 0)
      return Number(total.toFixed(1))
    }
    greenChain = 0
    const total = statusPoints(entry.status) + (recoveryDates.has(dayKey) ? RECOVERY_POINTS : 0)
    return Number(total.toFixed(1))
  })
}

export const calculatePointsInRange = (
  entries: Entry[],
  protocolRuns: ProtocolRun[],
  days: number,
  today = new Date()
): number => {
  const entryMap = mapEntries(entries)
  const range = lastNDays(days, today)
  const recoveryDates = getRecoveryDates(protocolRuns)
  return calculateRangeScore(entryMap, range, recoveryDates).totalScore
}

export const calculateTotalPoints = (entries: Entry[], protocolRuns: ProtocolRun[]): number => {
  const recoveryDates = getRecoveryDates(protocolRuns)
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let totalScore = 0
  let greenChain = 0
  let prevDate: Date | null = null
  sorted.forEach((entry) => {
    const entryDate = parseDate(entry.date)
    if (prevDate) {
      const expectedNext = new Date(prevDate)
      expectedNext.setDate(expectedNext.getDate() + 1)
      const isNextDay = entryDate.toDateString() === expectedNext.toDateString()
      if (!isNextDay) {
        greenChain = 0
      }
    }
    if (entry.status === 'green') {
      greenChain += 1
      const chainBonus = Math.min(greenChain * CHAIN_BONUS_PER_DAY, CHAIN_BONUS_CAP)
      totalScore += statusPoints(entry.status) + chainBonus
    } else {
      greenChain = 0
      totalScore += statusPoints(entry.status)
    }
    if (recoveryDates.has(entry.date)) {
      totalScore += RECOVERY_POINTS
    }
    prevDate = entryDate
  })
  return Number(totalScore.toFixed(1))
}

export const calculateStats = (
  entries: Entry[],
  protocolRunsOrToday: ProtocolRun[] | Date = [],
  todayArg?: Date
): TrackerStats => {
  const protocolRuns = protocolRunsOrToday instanceof Date ? [] : protocolRunsOrToday
  const today = protocolRunsOrToday instanceof Date ? protocolRunsOrToday : todayArg ?? new Date()
  const entryMap = mapEntries(entries)
  const last7Days = lastNDays(7, today)
  const last30Days = lastNDays(30, today)
  const recoveryDates = getRecoveryDates(protocolRuns)

  const last7Score = calculateRangeScore(entryMap, last7Days, recoveryDates)
  const last30Score = calculateRangeScore(entryMap, last30Days, recoveryDates)

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
    dailyScores: calculateDailyScores(entries, 30, today, protocolRuns)
  }
}

export type GoalProgress = {
  weekly: { current: number; target: number; remaining: number; percent: number }
  monthly: { current: number; target: number; remaining: number; percent: number }
}

const clampPercent = (value: number): number => Math.max(0, Math.min(1, value))

const getGoalValueForRange = (
  entries: Entry[],
  protocolRuns: ProtocolRun[],
  days: number,
  today: Date,
  mode: 'consistency' | 'green' | 'points'
): number => {
  const entryMap = mapEntries(entries)
  const range = lastNDays(days, today)
  const recoveryDates = getRecoveryDates(protocolRuns)
  const summary = calculateRangeScore(entryMap, range, recoveryDates)
  if (mode === 'green') return summary.counts.green
  if (mode === 'points') return summary.totalScore
  return summary.logged
}

export const calculateGoalProgress = (
  entries: Entry[],
  protocolRuns: ProtocolRun[],
  mode: 'consistency' | 'green' | 'points',
  weeklyTarget: number,
  monthlyTarget: number,
  today: Date = new Date()
): GoalProgress => {
  const weeklyCurrent = getGoalValueForRange(entries, protocolRuns, 7, today, mode)
  const monthlyCurrent = getGoalValueForRange(entries, protocolRuns, 30, today, mode)
  const weeklyRemaining = Math.max(0, weeklyTarget - weeklyCurrent)
  const monthlyRemaining = Math.max(0, monthlyTarget - monthlyCurrent)
  return {
    weekly: {
      current: Number(weeklyCurrent.toFixed(1)),
      target: weeklyTarget,
      remaining: Number(weeklyRemaining.toFixed(1)),
      percent: weeklyTarget ? clampPercent(weeklyCurrent / weeklyTarget) : 0
    },
    monthly: {
      current: Number(monthlyCurrent.toFixed(1)),
      target: monthlyTarget,
      remaining: Number(monthlyRemaining.toFixed(1)),
      percent: monthlyTarget ? clampPercent(monthlyCurrent / monthlyTarget) : 0
    }
  }
}

export const buildWeeklyGoalTimeline = (
  entries: Entry[],
  protocolRuns: ProtocolRun[],
  mode: 'consistency' | 'green' | 'points',
  weeks = 8,
  today: Date = new Date()
): number[] => {
  const values: number[] = []
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() - i * 7)
    const value = getGoalValueForRange(entries, protocolRuns, 7, endDate, mode)
    values.push(Number(value.toFixed(1)))
  }
  return values
}
