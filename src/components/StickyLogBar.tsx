import StatusPicker from './StatusPicker'
import { Status } from '../lib/types'
import { getStatusLabel } from '../lib/status'

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

type StickyLogBarProps = {
  status: Status | null
  onSelect: (status: Status) => void
  savedAt: number | null
}

const StickyLogBar = ({ status, onSelect, savedAt }: StickyLogBarProps) => {
  const statusLabel = status ? getStatusLabel(status) : 'Not logged yet'

  return (
    <div className="sticky-log-bar" role="region" aria-label="Log today">
      <div className="sticky-log-header">
        <div>
          <p className="sticky-log-title">Log today</p>
          <span className={`status-chip ${status ?? 'pending'}`}>Today: {statusLabel}</span>
        </div>
        <span className="saved-meta">{savedAt ? `Saved ${formatTime(savedAt)}` : 'Not saved yet'}</span>
      </div>
      <StatusPicker
        value={status}
        onChange={onSelect}
        size="medium"
        variant="compact"
        requireHoldForRed
      />
    </div>
  )
}

export default StickyLogBar
