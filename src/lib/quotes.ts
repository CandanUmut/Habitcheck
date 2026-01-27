export const quotes = [
  'Small steps, repeated, become big change.',
  'A reset is not a failure. It’s a decision.',
  'Progress is quieter than perfection.',
  'You can restart the day without starting over.',
  'Gentle consistency beats intense bursts.',
  'Today counts even if it is messy.',
  'Keep the bar kind and the effort steady.',
  'Momentum is built by showing up again.',
  'You are allowed to learn as you go.',
  'One honest check-in is a win.',
  'Your effort matters more than the color.',
  'Be proud of the days you showed up.',
  'Slow progress is still progress.',
  'Every streak begins with one logged day.',
  'You did not fail—you gathered data.',
  'Breathe, reset, continue.',
  'A calm return beats a perfect start.',
  'Steady is a strategy.',
  'Choose the next helpful step.',
  'Your future self notices your effort.',
  'Small changes compound quietly.',
  'Kindness keeps you moving.',
  'You can be imperfect and consistent.',
  'A single log is a vote for your goal.',
  'Let the data guide you, not judge you.',
  'You are allowed to take breaks and return.',
  'Soft progress is still progress.',
  'A mixed day still counts as showing up.',
  'Resetting is a skill, not a setback.',
  'One steady choice can shift the day.',
  'Progress is built in the pauses.',
  'Track the trend, not the mood.',
  'Consistency is a kindness to yourself.',
  'Your goal grows with every check-in.',
  'A small return beats a big promise.'
]

export const QUOTE_BAG_KEY = 'tracker.v4.quoteBag'
const HISTORY_LIMIT = 4

type QuoteBagState = {
  remaining: number[]
  history: number[]
}

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export const createShuffledIndices = (count: number, random: () => number = Math.random): number[] => {
  const indices = Array.from({ length: count }, (_, index) => index)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export const drawQuoteFromBag = (
  state: QuoteBagState,
  count: number,
  random: () => number = Math.random
): { index: number; nextState: QuoteBagState } => {
  let remaining = [...state.remaining]
  const history = [...state.history]
  if (remaining.length === 0) {
    remaining = createShuffledIndices(count, random)
    if (history.length > 0 && remaining.length > 1 && remaining[0] === history[0]) {
      ;[remaining[0], remaining[1]] = [remaining[1], remaining[0]]
    }
  }
  const index = remaining.shift() ?? 0
  const nextHistory = [index, ...history].slice(0, HISTORY_LIMIT)
  return {
    index,
    nextState: {
      remaining,
      history: nextHistory
    }
  }
}

const loadQuoteBag = (): QuoteBagState => {
  if (typeof window === 'undefined') {
    return { remaining: createShuffledIndices(quotes.length), history: [] }
  }
  const stored = safeJsonParse<QuoteBagState>(localStorage.getItem(QUOTE_BAG_KEY))
  if (!stored || !Array.isArray(stored.remaining) || !Array.isArray(stored.history)) {
    return { remaining: createShuffledIndices(quotes.length), history: [] }
  }
  return {
    remaining: stored.remaining.filter((value) => Number.isInteger(value) && value >= 0 && value < quotes.length),
    history: stored.history.filter((value) => Number.isInteger(value) && value >= 0 && value < quotes.length)
  }
}

const saveQuoteBag = (state: QuoteBagState): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUOTE_BAG_KEY, JSON.stringify(state))
}

export const getNextQuote = (random: () => number = Math.random): string => {
  const state = loadQuoteBag()
  const { index, nextState } = drawQuoteFromBag(state, quotes.length, random)
  saveQuoteBag(nextState)
  return quotes[index]
}

export const getRandomQuote = (): string => getNextQuote()
