import { describe, expect, it } from 'vitest'
import { buildBadgeContext, getBadgeDefinitions, getUnlockedBadgeIds } from './badges'
import { Entry, ProtocolRun } from './types'
import { formatDate } from './dates'

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
  completedSteps: 5,
  durationMinutes: 8
})

describe('badges', () => {
  it('unlocks streak and perfect week badges', () => {
    const start = new Date(2024, 0, 1)
    const entries: Entry[] = Array.from({ length: 7 }, (_, index) =>
      makeEntry(formatDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)), 'green')
    )
    const context = buildBadgeContext(entries, [], new Date(2024, 0, 7))
    const definitions = getBadgeDefinitions('tracker')
    const unlocked = getUnlockedBadgeIds(definitions, context)

    expect(unlocked).toContain('green-streak-7')
    expect(unlocked).toContain('perfect-week')
  })

  it('unlocks recovery and back-on-track badges', () => {
    const entries: Entry[] = [makeEntry('2024-01-01', 'red'), makeEntry('2024-01-02', 'green')]
    const runs: ProtocolRun[] = [makeProtocolRun('2024-01-01')]
    const context = buildBadgeContext(entries, runs)
    const definitions = getBadgeDefinitions('tracker')
    const unlocked = getUnlockedBadgeIds(definitions, context)

    expect(unlocked).toContain('protocol-1')
    expect(unlocked).toContain('back-on-track-1')
  })

  it('unlocks points badges based on totals', () => {
    const start = new Date(2024, 1, 1)
    const entries: Entry[] = Array.from({ length: 40 }, (_, index) =>
      makeEntry(formatDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)), 'green')
    )
    const context = buildBadgeContext(entries, [])
    const definitions = getBadgeDefinitions('tracker')
    const unlocked = getUnlockedBadgeIds(definitions, context)

    expect(unlocked).toContain('points-100')
  })
})
