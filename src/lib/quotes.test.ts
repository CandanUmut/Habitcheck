import { describe, expect, it } from 'vitest'
import { createShuffledIndices, drawQuoteFromBag, quotes } from './quotes'

describe('quotes', () => {
  it('contains at least 30 quotes', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(30)
  })

  it('creates a shuffled bag with all indices', () => {
    const indices = createShuffledIndices(5, () => 0.5)
    expect(indices.sort()).toEqual([0, 1, 2, 3, 4])
  })

  it('draws from the bag without immediate repeats on refill', () => {
    const state = { remaining: [], history: [0] }
    const result = drawQuoteFromBag(state, 3, () => 0)
    expect(result.index).not.toBe(0)
  })
})
