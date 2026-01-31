import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StatusPicker from '../components/StatusPicker'
import DonutChart from '../components/DonutChart'
import LineChart from '../components/LineChart'
import QuoteCard from '../components/QuoteCard'
import StatsCards from '../components/StatsCards'
import ProgressBar from '../components/ProgressBar'
import { Entry, ProtocolRun, Status, Tracker } from '../lib/types'
import { playStatusSound } from '../lib/sounds'
import { todayString } from '../lib/dates'
import { calculateGoalProgress, calculateStats } from '../lib/scoring'
import { getNextQuote } from '../lib/quotes'
import EmergencyProtocolModal from '../components/EmergencyProtocolModal'
import { createProtocolRun } from '../lib/protocol'
import { getGoalModeDescription, getGoalModeLabel, getGoalUnitLabel } from '../lib/goals'
import { getStatusLabel, statusMeta } from '../lib/status'
import StickyLogBar from '../components/StickyLogBar'

const celebrationCopy: Record<Status, { title: string; message: string }> = {
  green: { title: 'All good logged!', message: 'You are building momentum.' },
  yellow: { title: 'Mixed day logged!', message: 'Showing up matters.' },
  red: { title: 'Reset day logged!', message: 'Thanks for checking in. Be kind to yourself.' }
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
  const [quote, setQuote] = useState(() => getNextQuote())
  const [protocolOpen, setProtocolOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(entry?.updatedAt ?? null)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const toastTimeoutRef = useRef<number | null>(null)
  const lastSavedRef = useRef<{ status: Status; note: string } | null>(null)

  const trackerProtocolRuns = useMemo(
    () => protocolRuns.filter((run) => run.trackerId === tracker.id),
    [protocolRuns, tracker.id]
  )
  const stats = useMemo(() => calculateStats(entries, trackerProtocolRuns), [entries, trackerProtocolRuns])
  const goalProgress = useMemo(
    () =>
      calculateGoalProgress(
        entries,
        trackerProtocolRuns,
        tracker.goalMode,
        tracker.weeklyTarget,
        tracker.monthlyTarget
      ),
    [entries, trackerProtocolRuns, tracker.goalMode, tracker.weeklyTarget, tracker.monthlyTarget]
  )
  const last7Summary = `All good ${stats.last7.green} • Mixed ${stats.last7.yellow} • Reset ${stats.last7.red}`
  const todayStatusLabel = entry ? getStatusLabel(entry.status) : 'Not logged'
  const protocolToday = trackerProtocolRuns.find((run) => run.date === todayKey && run.completedAt)
  const lastSavedLabel = savedAt
    ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Not saved yet'

  useEffect(() => {
    setStatus(entry?.status ?? null)
    setNote(entry?.note ?? '')
    setSavedAt(entry?.updatedAt ?? null)
    if (entry?.status) {
      lastSavedRef.current = { status: entry.status, note: entry.note?.trim() ?? '' }
    } else {
      lastSavedRef.current = null
    }
  }, [entry?.status, entry?.note, entry?.updatedAt])

  useEffect(() => {
    if (!isActive) return
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'g') handleStatusSelect('green')
      if (key === 'y') handleStatusSelect('yellow')
      if (key === 'r') handleStatusSelect('red')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, handleStatusSelect])

  const triggerSavedToast = useCallback((timestamp: number) => {
    setSavedAt(timestamp)
    setShowSavedToast(true)
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => setShowSavedToast(false), 1600)
  }, [])

  const commitSave = useCallback(
    (nextStatus: Status, nextNote: string, timestamp = Date.now()) => {
      onSave(nextStatus, nextNote)
      lastSavedRef.current = { status: nextStatus, note: nextNote.trim() }
      triggerSavedToast(timestamp)
    },
    [onSave, triggerSavedToast]
  )

  const handleStatusSelect = useCallback(
    (nextStatus: Status) => {
      setStatus(nextStatus)
      commitSave(nextStatus, note)
      if (settings.soundsEnabled) {
        playStatusSound(nextStatus)
      }
      if (settings.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(nextStatus === 'red' ? 80 : 40)
      }
      setCelebration(nextStatus)
      window.setTimeout(() => setCelebration(null), 1500)
    },
    [commitSave, note, settings.hapticsEnabled, settings.soundsEnabled]
  )

  useEffect(() => {
    if (!status) return
    const trimmedNote = note.trim()
    const lastSaved = lastSavedRef.current
    if (lastSaved && lastSaved.status === status && lastSaved.note === trimmedNote) return
    const timeout = window.setTimeout(() => {
      commitSave(status, note)
    }, 650)
    return () => window.clearTimeout(timeout)
  }, [note, status])

  const handleNewQuote = () => {
    setQuote(getNextQuote())
  }

  const progressCards = [
    { label: 'All-good streak', value: stats.currentGreenStreak },
    { label: 'Last 7 breakdown', value: last7Summary },
    { label: 'Weekly points', value: `${stats.momentumWeekly} pts` }
  ]
  const unitLabel = getGoalUnitLabel(tracker.goalMode)
  const weeklyHelper =
    goalProgress.weekly.remaining <= 0
      ? 'Weekly goal hit 🎉'
      : `${goalProgress.weekly.remaining} ${unitLabel} left to hit your weekly goal`
  const monthlyHelper =
    goalProgress.monthly.remaining <= 0
      ? 'Monthly goal hit 🎉'
      : `${goalProgress.monthly.remaining} ${unitLabel} left to hit your monthly goal`

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Today</p>
        <h1>{tracker.name}</h1>
        <p className="subtle">Log today in under five seconds.</p>
        <span className={`status-chip ${entry?.status ?? 'pending'}`}>Today: {todayStatusLabel}</span>
      </header>

      <div className="card logging-card hero-card">
        <div className={`today-status ${entry?.status ?? 'pending'}`}>
          <div>
            <p className="subtle">Today’s check-in</p>
            <strong>{entry ? todayStatusLabel : 'Not logged yet'}</strong>
          </div>
          <span className="today-icon" aria-hidden>
            {entry ? statusMeta[entry.status].icon : '🗓️'}
          </span>
        </div>
        {!entry && (
          <div className="nudge">
            <strong>Quick nudge:</strong> You have not logged today yet.
          </div>
        )}
        <div className="log-today">
          <StatusPicker value={status} onChange={handleStatusSelect} size="large" requireHoldForRed />
          <div className="saved-row">
            <span className="saved-meta">{lastSavedLabel}</span>
            {showSavedToast && <span className="saved-toast">Saved ✓</span>}
          </div>
        </div>
        {tracker.dailyQuestionEnabled && (
          <div className="daily-question">
            <button
              type="button"
              className="ghost note-toggle"
              onClick={() => setNoteOpen((prev) => !prev)}
            >
              {noteOpen ? 'Hide note' : 'Add note'}
            </button>
            {noteOpen && (
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
          </div>
        )}
      </div>

      <div className="card progress-card">
        <div>
          <h3>Today + Progress</h3>
          <p className="subtle">
            Goal mode: {getGoalModeLabel(tracker.goalMode)} · {getGoalModeDescription(tracker.goalMode)}
          </p>
        </div>
        <div className="progress-grid">
          <ProgressBar
            label="Weekly target"
            value={goalProgress.weekly.current}
            target={goalProgress.weekly.target}
            helper={weeklyHelper}
            unit={getGoalUnitLabel(tracker.goalMode, true)}
            accent="green"
          />
          <ProgressBar
            label="Monthly target"
            value={goalProgress.monthly.current}
            target={goalProgress.monthly.target}
            helper={monthlyHelper}
            unit={getGoalUnitLabel(tracker.goalMode, true)}
            accent="yellow"
          />
        </div>
        <StatsCards items={progressCards} />
      </div>

      <div className="card insights-card">
        <h3>Mini trends</h3>
        <div className="insights-charts">
          <div className="chart-block">
            <p className="subtle">Last 7 days</p>
            <DonutChart counts={stats.last7} />
          </div>
          <div className="chart-block">
            <p className="subtle">14-day points trend</p>
            <LineChart values={stats.dailyScores.slice(-14)} />
            <p className="subtle tiny">Trend updates with every log.</p>
          </div>
        </div>
      </div>

      <QuoteCard quote={quote} onNewQuote={handleNewQuote} />

      <div className="card action-card">
        <div>
          <h3>Emergency Protocol</h3>
          <p className="subtle">Use this gentle reset when you feel friction. It counts as a recovery point.</p>
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
      <StickyLogBar status={status} onSelect={handleStatusSelect} savedAt={savedAt} />
    </section>
  )
}

export default HomePage
