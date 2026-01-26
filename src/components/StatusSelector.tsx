import { Status } from '../lib/types'

const STATUS_LABELS: Record<Status, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red'
}

const STATUS_HELP: Record<Status, string> = {
  green: 'On track',
  yellow: 'Mixed day',
  red: 'Tough day'
}

type StatusSelectorProps = {
  value: Status | null
  onChange: (status: Status) => void
  size?: 'large' | 'medium'
}

const StatusSelector = ({ value, onChange, size = 'large' }: StatusSelectorProps) => (
  <div className={`status-selector ${size}`} role="group" aria-label="Daily status">
    {(['green', 'yellow', 'red'] as Status[]).map((status) => (
      <button
        key={status}
        type="button"
        className={`status-button ${status} ${value === status ? 'selected' : ''}`}
        onClick={() => onChange(status)}
      >
        <span className="status-title">{STATUS_LABELS[status]}</span>
        <span className="status-subtitle">{STATUS_HELP[status]}</span>
      </button>
    ))}
  </div>
)

export default StatusSelector
