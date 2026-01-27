import { useEffect, useMemo, useState } from 'react'
import StatusPicker from '../components/StatusPicker'
import DonutChart from '../components/DonutChart'
import LineChart from '../components/LineChart'
import QuoteCard from '../components/QuoteCard'
import StatsCards from '../components/StatsCards'
import { Entry, ProtocolRun, Status, Tracker } from '../lib/types'
import { playStatusSound } from '../lib/sounds'
import { todayString } from '../lib/dates'
import { calculateStats } from '../lib/scoring'
import { getDailyQuote, getRandomQuote } from '../lib/quotes'
import EmergencyProtocolModal from '../components/EmergencyProtocolModal'
import { createProtocolRun } from '../lib/protocol'

const celebrationCopy: Record<Status, { title: string; message: string }> = {
  green: { title: 'Green logged!', message: 'You are building momentum.' },
  yellow: { title: 'Yellow logged!', message: 'Showing up matters.' },
  red: { title: 'Red logged!', message: 'Thanks for checking in. Be kind to yourself.' }
}

type HomePageProps = {
  tracker: Tracker
  entries: Entry[]
  protocolRuns: ProtocolRun[]
  settings: { soundsEnabled: boolean; hapticsEnabled: boolean }
  onSave: (status: Status, note: string) => void
  onStartProtocol: (run: ProtocolRun) => void
  onCompleteProtocol: (runId: string, completedSteps: number) => void
  isActive: boolean
}

const HomePage = ({
  tracker,
  entries,
  protocolRuns,
  settings,
  onSave,
  onStartProtocol,
  onCompleteProtocol,
  isActive
}: HomePageProps) => {
  const todayKey = todayString()
  const entry = entries.find((item) => item.date === todayKey)
  const [status, setStatus] = useState<Status | null>(entry?.status ?? null)
  const [note, setNote] = useState(entry?.note ?? '')
  const [celebration, setCelebration] = useState<Status | null>(null)
  const [quote, setQuote] = useState(() => getDailyQuote())
  const [protocolOpen, setProtocolOpen] = useState(false)

  const stats = useMemo(() => calculateStats(entries), [entries])
  const last7Summary = `${stats.last7.green}G ${stats.last7.yellow}Y ${stats.last7.red}R`
  const last30Summary = `${stats.last30.green}G ${stats.last30.yellow}Y ${stats.last30.red}R`
  const todayStatusLabel = entry ? entry.status.toUpperCase() : 'Not logged'
  const protocolToday = protocolRuns.find(
    (run) => run.trackerId === tracker.id && run.date === todayKey && run.completedAt
  )

  useEffect(() => {
    setStatus(entry?.status ?? null)
    setNote(entry?.note ?? '')
  }, [entry?.status, entry?.note])

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
    if (settings.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(status === 'red' ? 80 : 40)
    }
    setCelebration(status)
    window.setTimeout(() => setCelebration(null), 1800)
  }

  const handleNewQuote = () => {
    setQuote(getRandomQuote())
  }

  const insightCards = [
    { label: 'Green streak', value: stats.currentGreenStreak },
    { label: '7-day log', value: last7Summary },
    { label: '30-day log', value: last30Summary },
    { label: 'Momentum (wk/mo)', value: `${stats.momentumWeekly} / ${stats.momentumMonthly}` },
    { label: 'Today status', value: todayStatusLabel }
  ]

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Today</p>
        <h1>{tracker.name}</h1>
        <p className="subtle">Log today in under five seconds.</p>
      </header>

      <div className="card logging-card">
        {entry ? (
          <div className={`today-status ${entry.status}`}>
            <span>Today is already logged.</span>
            <strong>{entry.status.toUpperCase()}</strong>
          </div>
        ) : (
          <div className="nudge">
            <strong>Quick nudge:</strong> You have not logged today yet.
          </div>
        )}
        <StatusPicker value={status} onChange={setStatus} size="large" />
        {tracker.dailyQuestionEnabled && (
          <label className="field">
            <span>{tracker.dailyQuestionText}</span>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="A quick note..."
            />
          </label>
        )}
        <button type="button" className="primary" onClick={handleSave} disabled={!status}>
          Log today
        </button>
      </div>

      <div className="card insights-card">
        <h3>Key insights</h3>
        <StatsCards items={insightCards} />
        <div className="insights-charts">
          <div className="chart-block">
            <p className="subtle">Last 7 days</p>
            <DonutChart counts={stats.last7} />
          </div>
          <div className="chart-block">
            <p className="subtle">14-day momentum</p>
            <LineChart values={stats.dailyScores.slice(-14)} />
            <p className="subtle tiny">Trend updates with every log.</p>
          </div>
        </div>
      </div>

      <QuoteCard quote={quote} onNewQuote={handleNewQuote} />

      <div className="card action-card">
        <div>
          <h3>Emergency Protocol</h3>
          <p className="subtle">When you feel a spike of risk, tap the protocol to reset.</p>
          {protocolToday && <div className="badge">Protocol Save earned today</div>}
        </div>
        <button type="button" className="primary" onClick={() => setProtocolOpen(true)}>
          Start Emergency Protocol
        </button>
      </div>

      {celebration && (
        <div className={`celebration ${celebration}`}>
          <div className="celebration-inner">
            <h3>{celebrationCopy[celebration].title}</h3>
            <p>{celebrationCopy[celebration].message}</p>
          </div>
        </div>
      )}

      <EmergencyProtocolModal
        trackerId={tracker.id}
        isOpen={protocolOpen}
        onClose={() => setProtocolOpen(false)}
        onStart={onStartProtocol}
        onComplete={onCompleteProtocol}
        soundsEnabled={settings.soundsEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        createRun={createProtocolRun}
      />
    </section>
  )
}

export default HomePage
