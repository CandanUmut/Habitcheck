import { useEffect, useMemo, useState } from 'react'
import CalendarGrid from '../components/CalendarGrid'
import StatusPicker from '../components/StatusPicker'
import { Entry, Status } from '../lib/types'
import { formatDate, todayString } from '../lib/dates'
import { getStatusLabel } from '../lib/status'
import { NoteEntry, parseNoteValue, serializeNoteValue } from '../lib/notes'

type HistoryPageProps = {
  entries: Entry[]
  trackerName: string
  onSave: (date: string, status: Status, note: string) => void
}

const HistoryPage = ({ entries, trackerName, onSave }: HistoryPageProps) => {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [status, setStatus] = useState<Status | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const selectedKey = formatDate(selectedDate)
  const selectedEntry = entries.find((entry) => entry.date === selectedKey)
  const selectedStatusLabel = selectedEntry ? getStatusLabel(selectedEntry.status) : 'Not logged'
  const lastSavedLabel = selectedEntry?.updatedAt
    ? `Saved ${new Date(selectedEntry.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Not saved yet'

  useEffect(() => {
    setStatus(selectedEntry?.status ?? null)
    setNotes(parseNoteValue(selectedEntry?.note))
    setNoteDraft('')
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
    onSave(selectedKey, status, serializeNoteValue(notes))
  }

  const handleAddNote = () => {
    if (!status) return
    const trimmed = noteDraft.trim()
    if (!trimmed) return
    const nextNotes = [...notes, { text: trimmed, createdAt: Date.now() }]
    setNotes(nextNotes)
    setNoteDraft('')
    onSave(selectedKey, status, serializeNoteValue(nextNotes))
  }

  const handleDeleteNote = (noteToRemove: NoteEntry) => {
    if (!status) return
    const nextNotes = notes.filter(
      (note) => note.createdAt !== noteToRemove.createdAt || note.text !== noteToRemove.text
    )
    setNotes(nextNotes)
    onSave(selectedKey, status, serializeNoteValue(nextNotes))
  }

  const handleDeleteHistoricalNote = (noteToRemove: NoteEntry & { date: string }) => {
    const entry = entries.find((item) => item.date === noteToRemove.date)
    if (!entry) return
    const nextNotes = parseNoteValue(entry.note).filter(
      (note) => note.createdAt !== noteToRemove.createdAt || note.text !== noteToRemove.text
    )
    onSave(noteToRemove.date, entry.status, serializeNoteValue(nextNotes))
    if (noteToRemove.date === selectedKey) {
      setNotes(nextNotes)
    }
  }

  const noteHistory = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const allNotes = entries.flatMap((entry) =>
      parseNoteValue(entry.note).map((note) => ({
        ...note,
        date: entry.date,
        status: entry.status
      }))
    )
    const filtered = normalizedSearch
      ? allNotes.filter(
          (note) =>
            note.text.toLowerCase().includes(normalizedSearch) ||
            note.date.toLowerCase().includes(normalizedSearch)
        )
      : allNotes
    return filtered.sort((a, b) => {
      if (a.date === b.date) return b.createdAt - a.createdAt
      return b.date.localeCompare(a.date)
    })
  }, [entries, searchTerm])

  const selectedNotes = useMemo(
    () => [...notes].sort((a, b) => b.createdAt - a.createdAt),
    [notes]
  )

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
        <div className="note-panel">
          <div className="note-panel-header">
            <div>
              <p className="eyebrow">Notes</p>
              <h3 className="note-title">Notes for {selectedKey}</h3>
              <p className="subtle">Add context for this day.</p>
            </div>
            <div className="note-panel-meta">
              <span className="note-count">{selectedNotes.length} entries</span>
              <span className="note-hint">Saved to this date</span>
            </div>
          </div>
          <div className="note-composer">
            <label className="field note-field">
              <span>Add a note</span>
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Write a note for this day..."
              />
            </label>
            <div className="note-actions">
              <button
                type="button"
                className="primary"
                onClick={handleAddNote}
                disabled={!status || !noteDraft.trim()}
              >
                Add note
              </button>
              <button type="button" className="ghost" onClick={handleSave} disabled={!status}>
                Save status
              </button>
              {noteDraft.trim().length > 0 && (
                <button type="button" className="ghost" onClick={() => setNoteDraft('')}>
                  Clear draft
                </button>
              )}
            </div>
          </div>
        </div>
        {selectedNotes.length > 0 && (
          <div className="note-history">
            <div className="note-history-header">
              <p className="subtle">Notes for {selectedKey}</p>
              <span className="note-meta">
                Latest at {new Date(selectedNotes[0].createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <ul className="note-list">
              {selectedNotes.map((item) => (
                <li key={`${item.createdAt}-${item.text}`} className="note-item">
                  <p>{item.text}</p>
                  <div className="note-item-footer">
                    {item.createdAt > 0 && (
                      <span className="note-meta">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                    <button
                      type="button"
                      className="note-delete"
                      onClick={() => handleDeleteNote(item)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <div className="history-header">
          <div>
            <h3>Notes history</h3>
            <p className="subtle">Search by date or keyword to find past notes.</p>
          </div>
        </div>
        <label className="field">
          <span>Search notes</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search YYYY-MM-DD or a keyword..."
          />
        </label>
        {noteHistory.length === 0 ? (
          <p className="subtle">No notes match this search yet.</p>
        ) : (
          <ul className="note-list">
            {noteHistory.map((item) => (
              <li key={`${item.date}-${item.createdAt}-${item.text}`} className="note-item">
                <div className="note-header">
                  <strong>{item.date}</strong>
                  <span className={`status-chip ${item.status}`}>{getStatusLabel(item.status)}</span>
                </div>
                <p>{item.text}</p>
                <div className="note-item-footer">
                  {item.createdAt > 0 && (
                    <span className="note-meta">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                  <button
                    type="button"
                    className="note-delete"
                    onClick={() => handleDeleteHistoricalNote(item)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default HistoryPage
