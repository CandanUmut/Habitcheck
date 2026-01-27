import { Status } from './types'

export const statusMeta: Record<Status, { label: string; helper: string; icon: string }> = {
  green: { label: 'All good', helper: 'Aligned with my goal', icon: '✅' },
  yellow: { label: 'Mixed day', helper: 'Some friction today', icon: '🌊' },
  red: { label: 'Reset day', helper: 'Not my day — I reset', icon: '🔄' }
}

export const getStatusLabel = (status: Status): string => statusMeta[status].label

export const getStatusHelper = (status: Status): string => statusMeta[status].helper
