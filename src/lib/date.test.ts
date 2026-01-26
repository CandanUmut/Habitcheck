import { describe, expect, it } from 'vitest'
import { addDays, formatDate, getCalendarDays, lastNDays, parseDate } from './dates'

describe('date helpers', () => {
  it('formats and parses dates', () => {
    const date = new Date(2026, 0, 5)
    const value = formatDate(date)
    expect(value).toBe('2026-01-05')
    const parsed = parseDate(value)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(0)
    expect(parsed.getDate()).toBe(5)
  })

  it('returns full calendar grid', () => {
    const date = new Date(2024, 6, 1)
    const days = getCalendarDays(date)
    expect(days.length % 7).toBe(0)
    expect(days.length).toBeGreaterThanOrEqual(28)
  })

  it('builds last n days range', () => {
    const today = new Date(2024, 0, 10)
    const days = lastNDays(3, today)
    expect(days.map(formatDate)).toEqual(['2024-01-08', '2024-01-09', '2024-01-10'])
    const plus = addDays(today, 1)
    expect(formatDate(plus)).toBe('2024-01-11')
  })
})
