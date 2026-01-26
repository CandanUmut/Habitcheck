import { describe, expect, it } from 'vitest'
import { calculateStats } from './scoring'
import { Entry } from './types'

const makeEntry = (date: string, status: Entry['status']): Entry => ({
  date,
  status,
  updatedAt: Date.now()
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
    expect(stats.bestGreenStreakEver).toBe(2)
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
    expect(stats.bestGreenStreakEver).toBe(1)
  })
})
