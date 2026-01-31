export type Status = 'green' | 'yellow' | 'red'

export const statusMeta: Record<Status, { label: string; helper: string; icon: string }> = {
  green: { label: 'All good', helper: 'Aligned with my goal', icon: '✅' },
  yellow: { label: 'Mixed day', helper: 'Some friction today', icon: '🌊' },
  red: { label: 'Reset day', helper: 'Not my day — I reset', icon: '🔄' }
}

export function getStatusLabel(status: Status): string {
  return statusMeta[status].label
}

export function getStatusHelper(status: Status): string {
  return statusMeta[status].helper
}
