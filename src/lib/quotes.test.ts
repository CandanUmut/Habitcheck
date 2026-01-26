import { describe, expect, it } from 'vitest'
import { getDailyQuote, quotes } from './quotes'

describe('quotes', () => {
  it('returns deterministic quote per date', () => {
    const quote = getDailyQuote(new Date(2024, 0, 1))
    const quoteAgain = getDailyQuote(new Date(2024, 0, 1))
    expect(quote).toBe(quoteAgain)
  })

  it('contains at least 15 quotes', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(15)
  })
})
