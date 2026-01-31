import { useEffect, useState } from 'react'
import CalendarGrid from '../components/CalendarGrid'
import StatusPicker from '../components/StatusPicker'
import { Entry, Status } from '../lib/types'
import { formatDate, todayString } from '../lib/dates'
import { getStatusLabel } from '../lib/status'

type HistoryPageProps = {
  entries: Entry[]
  trackerName: string
  onSave: (date: string, status: Status, note: string) => void
}

const HistoryPage = ({ entries, trackerName, onSave }: HistoryPageProps) => {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [status, setStatus] = useState<Status | null>(null)
  const [note, setNote] = useState('')

  const selectedKey = formatDate(selectedDate)
  const selectedEntry = entries.find((entry) => entry.date === selectedKey)
  const selectedStatusLabel = selectedEntry ? getStatusLabel(selectedEntry.status) : 'Not logged'
  const lastSavedLabel = selectedEntry?.updatedAt
    ? `Saved ${new Date(selectedEntry.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Not saved yet'

  useEffect(() => {
    setStatus(selectedEntry?.status ?? null)
    setNote(selectedEntry?.note ?? '')
  }, [selectedEntry])

  useEffect(() => {
    setSelectedDate(new Date())
  }, [])

  const goMonth = (offset: number) => {
    const next = new Date(month)
    next.setMonth(next.getMonth() + offset)
    setMonth(next)
  }

  const handleSave = () => {
    if (!status) return
    onSave(selectedKey, status, note)
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">History</p>
        <h1>{trackerName}</h1>
        <p className="subtle">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        <div className="month-controls">
          <button type="button" className="ghost" onClick={() => goMonth(-1)}>
            ← Prev
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setMonth(new Date())
              setSelectedDate(new Date())
            }}
          >
            Jump to today
          </button>
          <button type="button" className="ghost" onClick={() => goMonth(1)}>
            Next →
          </button>
        </div>
      </header>

      <CalendarGrid
        month={month}
        entries={entries}
        selectedDate={selectedDate}
        onSelect={(date) => setSelectedDate(date)}
      />

      <div className="card">
        <div className="history-header">
          <div>
            <h3>{selectedKey === todayString() ? 'Today' : selectedKey}</h3>
            <span className={`status-chip ${selectedEntry?.status ?? 'pending'}`}>
              {selectedKey === todayString() ? 'Today' : 'Selected'}: {selectedStatusLabel}
            </span>
          </div>
          <span className="saved-meta">{lastSavedLabel}</span>
        </div>
        <StatusPicker value={status} onChange={setStatus} size="medium" requireHoldForRed />
        <label className="field">
          <span>Optional note</span>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a short note..."
          />
        </label>
        <button type="button" className="primary" onClick={handleSave} disabled={!status}>
          Save update
        </button>
      </div>
    </section>
  )
}

export default HistoryPage
