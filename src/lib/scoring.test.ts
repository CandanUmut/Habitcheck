import { describe, expect, it } from 'vitest'
import { calculateDailyScores, calculateGoalProgress, calculatePointsInRange, calculateStats } from './scoring'
import { Entry, ProtocolRun } from './types'

const makeEntry = (date: string, status: Entry['status']): Entry => ({
  date,
  status,
  updatedAt: Date.now()
})

const makeProtocolRun = (date: string): ProtocolRun => ({
  id: `run-${date}`,
  trackerId: 'tracker-1',
  date,
  startedAt: Date.now(),
  completedAt: Date.now(),
  completedSteps: 6,
  durationMinutes: 10
})

describe('scoring', () => {
  it('calculates streaks and counts', () => {
    const entries: Entry[] = [
      makeEntry('2024-01-01', 'green'),
      makeEntry('2024-01-02', 'green'),
      makeEntry('2024-01-03', 'yellow'),
      makeEntry('2024-01-04', 'green'),
      makeEntry('2024-01-05', 'green')
    ]

    const stats = calculateStats(entries, new Date(2024, 0, 5))
    expect(stats.bestGreenStreak).toBe(2)
    expect(stats.currentGreenStreak).toBe(2)
    expect(stats.loggingStreak).toBe(5)
    expect(stats.last7.green).toBe(4)
    expect(stats.last7.yellow).toBe(1)
  })

  it('resets green streak on red', () => {
    const entries: Entry[] = [
      makeEntry('2024-01-01', 'green'),
      makeEntry('2024-01-02', 'red'),
      makeEntry('2024-01-03', 'green')
    ]

    const stats = calculateStats(entries, new Date(2024, 0, 3))
    expect(stats.currentGreenStreak).toBe(1)
    expect(stats.bestGreenStreak).toBe(1)
  })

  it('builds a daily score trend', () => {
    const entries: Entry[] = [
      makeEntry('2024-01-01', 'green'),
      makeEntry('2024-01-02', 'green'),
      makeEntry('2024-01-03', 'yellow')
    ]

    const trend = calculateDailyScores(entries, 3, new Date(2024, 0, 3))
    expect(trend.length).toBe(3)
    expect(trend[0]).toBeGreaterThan(3)
    expect(trend[2]).toBe(1)
  })

  it('adds recovery points when protocol is completed', () => {
    const entries: Entry[] = [makeEntry('2024-01-01', 'green')]
    const runs: ProtocolRun[] = [makeProtocolRun('2024-01-01')]
    const score = calculatePointsInRange(entries, runs, 1, new Date(2024, 0, 1))
    expect(score).toBeGreaterThan(3)
  })

  it('calculates goal progress across modes', () => {
    const entries: Entry[] = [
      makeEntry('2024-01-01', 'green'),
      makeEntry('2024-01-02', 'yellow'),
      makeEntry('2024-01-03', 'green'),
      makeEntry('2024-01-04', 'red'),
      makeEntry('2024-01-05', 'green')
    ]
    const today = new Date(2024, 0, 5)

    const consistency = calculateGoalProgress(entries, [], 'consistency', 5, 20, today)
    expect(consistency.weekly.current).toBe(5)

    const greenGoal = calculateGoalProgress(entries, [], 'green', 3, 12, today)
    expect(greenGoal.weekly.current).toBe(3)

    const pointsGoal = calculateGoalProgress(entries, [], 'points', 10, 40, today)
    const pointsValue = calculatePointsInRange(entries, [], 7, today)
    expect(pointsGoal.weekly.current).toBe(pointsValue)
  })
})
