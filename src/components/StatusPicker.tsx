import { Status } from '../lib/types'

const statusMeta: Record<Status, { title: string; subtitle: string }> = {
  green: { title: 'Green', subtitle: 'On track and steady' },
  yellow: { title: 'Yellow', subtitle: 'A softer day' },
  red: { title: 'Red', subtitle: 'Needs care' }
}

type StatusPickerProps = {
  value: Status | null
  onChange: (status: Status) => void
  size?: 'large' | 'medium'
}

const StatusPicker = ({ value, onChange, size = 'large' }: StatusPickerProps) => (
  <div className={`status-selector ${size}`}>
    {(Object.keys(statusMeta) as Status[]).map((status) => (
      <button
        key={status}
        type="button"
        className={`status-button ${status} ${value === status ? 'selected' : ''}`}
        onClick={() => onChange(status)}
      >
        <span className="status-title">{statusMeta[status].title}</span>
        <span className="status-subtitle">{statusMeta[status].subtitle}</span>
      </button>
    ))}
  </div>
)

export default StatusPicker
