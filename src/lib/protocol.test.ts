import { describe, expect, it } from 'vitest'
import { completeProtocolRun, createProtocolRun, getCompletedProtocolRunsInRange } from './protocol'

describe('protocol logging', () => {
  it('creates and completes a protocol run', () => {
    const run = createProtocolRun('tracker-1', 15, new Date('2024-04-10T10:00:00Z').getTime())
    const completed = completeProtocolRun(run, 6, new Date('2024-04-10T10:10:00Z').getTime())

    expect(completed.trackerId).toBe('tracker-1')
    expect(completed.durationMinutes).toBe(15)
    expect(completed.completedSteps).toBe(6)
    expect(completed.completedAt).toBeDefined()
  })

  it('filters completed runs in the last 30 days', () => {
    const run = createProtocolRun('tracker-1', 10, new Date('2024-04-10T10:00:00Z').getTime())
    const completed = completeProtocolRun(run, 8, new Date('2024-04-10T10:10:00Z').getTime())
    const runs = [
      completed,
      createProtocolRun('tracker-1', 10, new Date('2024-01-01T10:00:00Z').getTime())
    ]

    const recent = getCompletedProtocolRunsInRange(runs, 'tracker-1', 30, new Date('2024-04-20T10:00:00Z'))
    expect(recent).toHaveLength(1)
    expect(recent[0].completedSteps).toBe(8)
  })
})
