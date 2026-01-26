import { formatDate } from './dates'

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
  'A calm return beats a perfect start.'
]

const hashString = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1_000_000_007
  }
  return Math.abs(hash)
}

export const getDailyQuote = (date: Date = new Date()): string => {
  const seed = hashString(formatDate(date))
  const index = seed % quotes.length
  return quotes[index]
}

export const getRandomQuote = (): string => {
  const index = Math.floor(Math.random() * quotes.length)
  return quotes[index]
}
