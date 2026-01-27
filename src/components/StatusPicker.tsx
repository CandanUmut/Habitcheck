import { Status } from '../lib/types'
import { statusMeta } from '../lib/status'

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
        <span className="status-icon" aria-hidden>
          {statusMeta[status].icon}
        </span>
        <span className="status-title">{statusMeta[status].label}</span>
        <span className="status-subtitle">{statusMeta[status].helper}</span>
      </button>
    ))}
  </div>
)

export default StatusPicker
