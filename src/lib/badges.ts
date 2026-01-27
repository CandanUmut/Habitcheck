import { Badge, Entry, ProtocolRun } from './types'
import { calculateStats, calculateTotalPoints } from './scoring'
import { formatDate, parseDate } from './dates'

export type BadgeDefinition = {
  id: string
  title: string
  description: string
  icon: string
  scope: 'tracker' | 'global'
  category: 'Consistency' | 'Streak' | 'Recovery' | 'Milestone'
  check: (context: BadgeContext) => boolean
}

export type BadgeContext = {
  loggedDays: number
  bestGreenStreak: number
  bestLoggingStreak: number
  last7Green: number
  totalPoints: number
  recoveryCount: number
  backOnTrackCount: number
}

const countBackOnTrack = (entries: Entry[]): number => {
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]))
  return entries.reduce((count, entry) => {
    if (entry.status !== 'green') return count
    const entryDate = parseDate(entry.date)
    const previous = new Date(entryDate)
    previous.setDate(previous.getDate() - 1)
    const previousEntry = entryMap.get(formatDate(previous))
    if (previousEntry?.status === 'red') {
      return count + 1
    }
    return count
  }, 0)
}

export const buildBadgeContext = (
  entries: Entry[],
  protocolRuns: ProtocolRun[],
  today: Date = new Date()
): BadgeContext => {
  const stats = calculateStats(entries, protocolRuns, today)
  return {
    loggedDays: entries.length,
    bestGreenStreak: stats.bestGreenStreak,
    bestLoggingStreak: stats.bestLoggingStreak,
    last7Green: stats.last7.green,
    totalPoints: calculateTotalPoints(entries, protocolRuns),
    recoveryCount: protocolRuns.filter((run) => run.completedAt).length,
    backOnTrackCount: countBackOnTrack(entries)
  }
}

const trackerBadgeDefinitions: BadgeDefinition[] = [
  {
    id: 'first-log',
    title: 'First check-in',
    description: 'Logged your first day.',
    icon: '🌱',
    scope: 'tracker',
    category: 'Consistency',
    check: (context) => context.loggedDays >= 1
  },
  {
    id: 'logged-7',
    title: '7 days logged',
    description: 'Logged seven days total.',
    icon: '📆',
    scope: 'tracker',
    category: 'Consistency',
    check: (context) => context.loggedDays >= 7
  },
  {
    id: 'logged-30',
    title: '30 days logged',
    description: 'Logged thirty days total.',
    icon: '🗓️',
    scope: 'tracker',
    category: 'Consistency',
    check: (context) => context.loggedDays >= 30
  },
  {
    id: 'logged-60',
    title: '60 days logged',
    description: 'Logged sixty days total.',
    icon: '🗓️',
    scope: 'tracker',
    category: 'Consistency',
    check: (context) => context.loggedDays >= 60
  },
  {
    id: 'logging-streak-7',
    title: '7-day log streak',
    description: 'Logged seven days in a row.',
    icon: '🔥',
    scope: 'tracker',
    category: 'Consistency',
    check: (context) => context.bestLoggingStreak >= 7
  },
  {
    id: 'logging-streak-14',
    title: '14-day log streak',
    description: 'Logged fourteen days in a row.',
    icon: '🔥',
    scope: 'tracker',
    category: 'Consistency',
    check: (context) => context.bestLoggingStreak >= 14
  },
  {
    id: 'green-streak-7',
    title: '7 all-good streak',
    description: 'All good for seven days in a row.',
    icon: '✅',
    scope: 'tracker',
    category: 'Streak',
    check: (context) => context.bestGreenStreak >= 7
  },
  {
    id: 'green-streak-14',
    title: '14 all-good streak',
    description: 'All good for fourteen days in a row.',
    icon: '🌿',
    scope: 'tracker',
    category: 'Streak',
    check: (context) => context.bestGreenStreak >= 14
  },
  {
    id: 'green-streak-30',
    title: '30 all-good streak',
    description: 'All good for thirty days in a row.',
    icon: '🏆',
    scope: 'tracker',
    category: 'Streak',
    check: (context) => context.bestGreenStreak >= 30
  },
  {
    id: 'protocol-1',
    title: 'First protocol',
    description: 'Completed the Emergency Protocol once.',
    icon: '🛟',
    scope: 'tracker',
    category: 'Recovery',
    check: (context) => context.recoveryCount >= 1
  },
  {
    id: 'protocol-3',
    title: 'Steady reset',
    description: 'Completed the protocol three times.',
    icon: '🧭',
    scope: 'tracker',
    category: 'Recovery',
    check: (context) => context.recoveryCount >= 3
  },
  {
    id: 'protocol-7',
    title: 'Recovery toolkit',
    description: 'Completed the protocol seven times.',
    icon: '🧰',
    scope: 'tracker',
    category: 'Recovery',
    check: (context) => context.recoveryCount >= 7
  },
  {
    id: 'back-on-track-1',
    title: 'Back on track',
    description: 'Turned a red day into a green day.',
    icon: '🌤️',
    scope: 'tracker',
    category: 'Recovery',
    check: (context) => context.backOnTrackCount >= 1
  },
  {
    id: 'back-on-track-3',
    title: 'Bounce back',
    description: 'Recovered from three red days.',
    icon: '🌈',
    scope: 'tracker',
    category: 'Recovery',
    check: (context) => context.backOnTrackCount >= 3
  },
  {
    id: 'points-100',
    title: '100 points',
    description: 'Earned 100 points total.',
    icon: '💯',
    scope: 'tracker',
    category: 'Milestone',
    check: (context) => context.totalPoints >= 100
  },
  {
    id: 'points-250',
    title: '250 points',
    description: 'Earned 250 points total.',
    icon: '✨',
    scope: 'tracker',
    category: 'Milestone',
    check: (context) => context.totalPoints >= 250
  },
  {
    id: 'points-500',
    title: '500 points',
    description: 'Earned 500 points total.',
    icon: '🌟',
    scope: 'tracker',
    category: 'Milestone',
    check: (context) => context.totalPoints >= 500
  },
  {
    id: 'perfect-week',
    title: 'Perfect week',
    description: 'Seven all-good days in the last week.',
    icon: '🏅',
    scope: 'tracker',
    category: 'Milestone',
    check: (context) => context.last7Green >= 7
  }
]

const globalBadgeDefinitions: BadgeDefinition[] = [
  {
    id: 'global-first-log',
    title: 'First check-in (all trackers)',
    description: 'Logged your first day anywhere.',
    icon: '🌍',
    scope: 'global',
    category: 'Milestone',
    check: (context) => context.loggedDays >= 1
  },
  {
    id: 'global-30-logs',
    title: '30 total logs',
    description: 'Logged thirty days across trackers.',
    icon: '🧭',
    scope: 'global',
    category: 'Consistency',
    check: (context) => context.loggedDays >= 30
  },
  {
    id: 'global-100-logs',
    title: '100 total logs',
    description: 'Logged one hundred days across trackers.',
    icon: '🏁',
    scope: 'global',
    category: 'Consistency',
    check: (context) => context.loggedDays >= 100
  },
  {
    id: 'global-1000-points',
    title: '1,000 points',
    description: 'Earned 1,000 points across trackers.',
    icon: '🚀',
    scope: 'global',
    category: 'Milestone',
    check: (context) => context.totalPoints >= 1000
  }
]

export const getBadgeDefinitions = (scope: 'tracker' | 'global'): BadgeDefinition[] =>
  scope === 'tracker' ? trackerBadgeDefinitions : globalBadgeDefinitions

export const getUnlockedBadgeIds = (definitions: BadgeDefinition[], context: BadgeContext): string[] =>
  definitions.filter((badge) => badge.check(context)).map((badge) => badge.id)

export const awardBadges = (
  earned: Badge[],
  definitions: BadgeDefinition[],
  context: BadgeContext,
  today: Date = new Date()
): { updated: Badge[]; newlyEarned: Badge[] } => {
  const existingIds = new Set(earned.map((badge) => badge.id))
  const unlocked = getUnlockedBadgeIds(definitions, context)
  const newlyEarnedIds = unlocked.filter((id) => !existingIds.has(id))
  const earnedAt = formatDate(today)
  const nextBadges = [...earned]
  const newlyEarned: Badge[] = []
  newlyEarnedIds.forEach((id) => {
    const def = definitions.find((item) => item.id === id)
    if (!def) return
    const badge = {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      earnedAt
    }
    nextBadges.push(badge)
    newlyEarned.push(badge)
  })
  return { updated: nextBadges, newlyEarned }
}
