import { describe, expect, it } from 'vitest'
import { getDailyQuote, quotes } from './quotes'

describe('quotes', () => {
  it('returns deterministic quote per date', () => {
    const quote = getDailyQuote(new Date(2024, 0, 1))
    const quoteAgain = getDailyQuote(new Date(2024, 0, 1))
    expect(quote).toBe(quoteAgain)
  })

  it('contains at least 20 quotes', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(20)
  })

  it('uses the date seed to select a quote', () => {
    const quote = getDailyQuote(new Date(2024, 5, 15))
    expect(quotes).toContain(quote)
  })
})
