import { Tracker } from '../lib/types'

type TrackerTabsProps = {
  trackers: Tracker[]
  activeId?: string
  onChange: (id: string) => void
  onAdd: () => void
}

const TrackerTabs = ({ trackers, activeId, onChange, onAdd }: TrackerTabsProps) => (
  <div className="tracker-tabs">
    <div className="tracker-tab-row">
      {trackers.map((tracker) => (
        <button
          key={tracker.id}
          type="button"
          className={`tracker-tab ${tracker.id === activeId ? 'active' : ''}`}
          onClick={() => onChange(tracker.id)}
        >
          {tracker.name}
        </button>
      ))}
      <button type="button" className="tracker-tab add" onClick={onAdd} aria-label="Add tracker">
        + Add
      </button>
    </div>
  </div>
)

export default TrackerTabs
