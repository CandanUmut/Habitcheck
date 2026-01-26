import { useEffect, useState } from 'react'
import StatusSelector from '../components/StatusSelector'
import { Entry, Settings, Status } from '../lib/types'
import { playStatusSound } from '../lib/sounds'

const celebrationCopy: Record<Status, { title: string; message: string }> = {
  green: { title: 'Green logged!', message: 'You are building momentum.' },
  yellow: { title: 'Yellow logged!', message: 'Showing up matters.' },
  red: { title: 'Red logged!', message: 'Thanks for checking in. Be kind to yourself.' }
}

type HomePageProps = {
  settings: Settings
  entry: Entry | undefined
  onSave: (status: Status, note: string) => void
  isActive: boolean
  showNudge: boolean
}

const HomePage = ({ settings, entry, onSave, isActive, showNudge }: HomePageProps) => {
  const [status, setStatus] = useState<Status | null>(entry?.status ?? null)
  const [note, setNote] = useState(entry?.note ?? '')
  const [celebration, setCelebration] = useState<Status | null>(null)

  useEffect(() => {
    setStatus(entry?.status ?? null)
    setNote(entry?.note ?? '')
  }, [entry])

  useEffect(() => {
    if (!isActive) return
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'g') setStatus('green')
      if (key === 'y') setStatus('yellow')
      if (key === 'r') setStatus('red')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive])

  const handleSave = () => {
    if (!status) return
    onSave(status, note)
    if (settings.soundsEnabled) {
      playStatusSound(status)
    }
    setCelebration(status)
    window.setTimeout(() => setCelebration(null), 1800)
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Today</p>
        <h1>{settings.goalName || 'Your daily goal'}</h1>
        <p className="subtle">Log today in under five seconds.</p>
      </header>

      {showNudge && (
        <div className="nudge">
          <strong>Quick nudge:</strong> You have not logged today yet.
        </div>
      )}

      <StatusSelector value={status} onChange={setStatus} size="large" />

      {settings.dailyQuestionEnabled && (
        <div className="card">
          <label className="field">
            <span>{settings.dailyQuestionText}</span>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="A quick note..."
            />
          </label>
        </div>
      )}

      <button type="button" className="primary" onClick={handleSave} disabled={!status}>
        Log today
      </button>

      {celebration && (
        <div className={`celebration ${celebration}`}>
          <div className="celebration-inner">
            <h3>{celebrationCopy[celebration].title}</h3>
            <p>{celebrationCopy[celebration].message}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default HomePage
