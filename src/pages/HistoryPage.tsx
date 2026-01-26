import { useEffect, useState } from 'react'
import CalendarGrid from '../components/CalendarGrid'
import StatusSelector from '../components/StatusSelector'
import { Entry, Status } from '../lib/types'
import { formatDate, todayString } from '../lib/date'

type HistoryPageProps = {
  entries: Entry[]
  onSave: (date: string, status: Status, note: string) => void
}

const HistoryPage = ({ entries, onSave }: HistoryPageProps) => {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [status, setStatus] = useState<Status | null>(null)
  const [note, setNote] = useState('')

  const selectedKey = formatDate(selectedDate)
  const selectedEntry = entries.find((entry) => entry.date === selectedKey)

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
        <h1>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
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
        <h3>{selectedKey === todayString() ? 'Today' : selectedKey}</h3>
        <StatusSelector value={status} onChange={setStatus} size="medium" />
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
