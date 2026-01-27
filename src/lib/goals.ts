import { GoalMode } from './types'

export const goalDefaults: Record<GoalMode, { weekly: number; monthly: number }> = {
  consistency: { weekly: 7, monthly: 30 },
  green: { weekly: 4, monthly: 16 },
  points: { weekly: 15, monthly: 60 }
}

export const goalModeOptions: { value: GoalMode; label: string; description: string }[] = [
  { value: 'consistency', label: 'Consistency', description: 'Log every day' },
  { value: 'green', label: 'Green days', description: 'Aim for green days' },
  { value: 'points', label: 'Points', description: 'Aim for points' }
]

export const getGoalDefaults = (mode: GoalMode): { weekly: number; monthly: number } =>
  goalDefaults[mode] ?? goalDefaults.consistency

export const getGoalModeLabel = (mode: GoalMode): string => {
  if (mode === 'green') return 'Green days'
  if (mode === 'points') return 'Points'
  return 'Consistency'
}

export const getGoalModeDescription = (mode: GoalMode): string => {
  if (mode === 'green') return 'Aim for green days each week'
  if (mode === 'points') return 'Aim for points each week'
  return 'Log every day'
}

export const getGoalUnitLabel = (mode: GoalMode, short = false): string => {
  if (mode === 'points') return short ? 'pts' : 'points'
  if (mode === 'green') return short ? 'days' : 'green days'
  return short ? 'days' : 'days logged'
}
