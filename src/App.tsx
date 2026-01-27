import { useEffect, useMemo, useState } from 'react'
import NavTabs, { PageKey } from './components/NavTabs'
import TrackerTabs from './components/TrackerTabs'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'
import { createTracker, isOnboardingComplete, loadAppData, saveAppData, setOnboardingComplete } from './lib/storage'
import { AppData, Badge, Entry, ProtocolRun, Status, Tracker } from './lib/types'
import { todayString } from './lib/dates'
import AppIcon from './components/AppIcon'
import { awardBadges, buildBadgeContext, getBadgeDefinitions } from './lib/badges'
import BadgeCelebration from './components/BadgeCelebration'
import { playBadgeSound } from './lib/sounds'

const App = () => {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [page, setPage] = useState<PageKey>('home')
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete())
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([])
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null)

  useEffect(() => {
    saveAppData(data)
  }, [data])

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
  }, [data.settings.theme])

  useEffect(() => {
    if (data.trackers.length > 0 && !isOnboardingComplete()) {
      setOnboardingComplete(true)
      setShowOnboarding(false)
    }
  }, [data.trackers.length])

  useEffect(() => {
    const handleStatus = () => setIsOffline(typeof navigator !== 'undefined' && !navigator.onLine)
    window.addEventListener('online', handleStatus)
    window.addEventListener('offline', handleStatus)
    return () => {
      window.removeEventListener('online', handleStatus)
      window.removeEventListener('offline', handleStatus)
    }
  }, [])

  useEffect(() => {
    if (!activeBadge && badgeQueue.length > 0) {
      setActiveBadge(badgeQueue[0])
      setBadgeQueue((prev) => prev.slice(1))
    }
  }, [activeBadge, badgeQueue])

  useEffect(() => {
    if (activeBadge && data.settings.soundsEnabled) {
      playBadgeSound()
    }
  }, [activeBadge, data.settings.soundsEnabled])

  useEffect(() => {
    const { badges, newlyEarned } = syncBadges(data)
    if (newlyEarned.length === 0) return
    setData((prev) => ({ ...prev, badges }))
    setBadgeQueue((prev) => [...prev, ...newlyEarned])
  }, [data.entries, data.protocolRuns, data.trackers, data.badges])

  const trackers = data.trackers
  const activeTracker = useMemo(
    () => trackers.find((tracker) => tracker.id === data.activeTrackerId) ?? trackers[0],
    [trackers, data.activeTrackerId]
  )
  const activeTrackerId = activeTracker?.id
  const activeEntries = activeTrackerId ? data.entries[activeTrackerId] ?? [] : []

  const syncBadges = (payload: AppData): { badges: AppData['badges']; newlyEarned: Badge[] } => {
    const trackerDefinitions = getBadgeDefinitions('tracker')
    const globalDefinitions = getBadgeDefinitions('global')
    const newlyEarned: Badge[] = []
    const nextTrackers = { ...payload.badges.trackers }

    payload.trackers.forEach((tracker) => {
      const entries = payload.entries[tracker.id] ?? []
      const runs = payload.protocolRuns.filter((run) => run.trackerId === tracker.id)
      const context = buildBadgeContext(entries, runs)
      const earned = payload.badges.trackers[tracker.id] ?? []
      const result = awardBadges(earned, trackerDefinitions, context)
      nextTrackers[tracker.id] = result.updated
      newlyEarned.push(...result.newlyEarned)
    })

    const allEntries = Object.values(payload.entries).flat()
    const globalContext = buildBadgeContext(allEntries, payload.protocolRuns)
    const globalResult = awardBadges(payload.badges.global ?? [], globalDefinitions, globalContext)
    newlyEarned.push(...globalResult.newlyEarned)

    return {
      badges: {
        global: globalResult.updated,
        trackers: nextTrackers
      },
      newlyEarned
    }
  }

  const updateEntries = (trackerId: string, entries: Entry[]) => {
    setData((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [trackerId]: entries
      }
    }))
  }

  const updateEntry = (trackerId: string, date: string, status: Status, note: string) => {
    setData((prev) => {
      const existing = prev.entries[trackerId] ?? []
      const filtered = existing.filter((entry) => entry.date !== date)
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [trackerId]: [
            ...filtered,
            {
              date,
              status,
              note: note.trim() ? note.trim() : undefined,
              updatedAt: Date.now()
            }
          ]
        }
      }
    })
  }

  const addProtocolRun = (run: ProtocolRun) => {
    setData((prev) => ({
      ...prev,
      protocolRuns: [...prev.protocolRuns, run]
    }))
  }

  const completeProtocolRun = (runId: string, completedSteps: number) => {
    setData((prev) => ({
      ...prev,
      protocolRuns: prev.protocolRuns.map((run) =>
        run.id === runId
          ? {
              ...run,
              completedSteps,
              completedAt: Date.now()
            }
          : run
      )
    }))
  }

  const handleAddTracker = () => {
    const name = window.prompt('Name your tracker')?.trim()
    if (!name) return
    const tracker = createTracker(name)
    setData((prev) => ({
      ...prev,
      trackers: [...prev.trackers, tracker],
      entries: { ...prev.entries, [tracker.id]: [] },
      activeTrackerId: tracker.id
    }))
  }

  if (trackers.length === 0 || showOnboarding) {
    return (
      <OnboardingPage
        tracker={activeTracker}
        onSkip={() => {
          if (trackers.length === 0) {
            const tracker = createTracker('My goal')
            setData((prev) => ({
              ...prev,
              trackers: [tracker],
              entries: { ...prev.entries, [tracker.id]: [] },
              activeTrackerId: tracker.id
            }))
          }
          setOnboardingComplete(true)
          setShowOnboarding(false)
        }}
        onComplete={(tracker: Tracker) => {
          setData((prev) => {
            const hasTracker = prev.trackers.find((item) => item.id === tracker.id)
            const nextTrackers = hasTracker
              ? prev.trackers.map((item) => (item.id === tracker.id ? tracker : item))
              : [tracker]
            return {
              ...prev,
              trackers: nextTrackers,
              entries: hasTracker ? prev.entries : { ...prev.entries, [tracker.id]: [] },
              activeTrackerId: tracker.id
            }
          })
          setOnboardingComplete(true)
          setShowOnboarding(false)
        }}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <AppIcon size={36} />
          <div>
            <p className="brand-title">Habitcheck</p>
            <p className="brand-subtitle">Private • Offline-first</p>
          </div>
        </div>
        {isOffline && <span className="offline-pill">Offline mode</span>}
      </header>
      <main className="content">
        <TrackerTabs
          trackers={trackers}
          activeId={activeTrackerId}
          onChange={(id) => setData((prev) => ({ ...prev, activeTrackerId: id }))}
          onAdd={handleAddTracker}
        />
        {page === 'home' && activeTracker && (
          <HomePage
            tracker={activeTracker}
            entries={activeEntries}
            protocolRuns={data.protocolRuns}
            settings={data.settings}
            onSave={(status, note) => updateEntry(activeTracker.id, todayString(), status, note)}
            onStartProtocol={addProtocolRun}
            onCompleteProtocol={completeProtocolRun}
            isActive={page === 'home'}
          />
        )}
        {page === 'history' && activeTracker && (
          <HistoryPage
            entries={activeEntries}
            trackerName={activeTracker.name}
            onSave={(date, status, note) => updateEntry(activeTracker.id, date, status, note)}
          />
        )}
        {page === 'insights' && activeTracker && (
          <InsightsPage
            entries={activeEntries}
            tracker={activeTracker}
            protocolRuns={data.protocolRuns}
            trackerId={activeTracker.id}
            badges={data.badges}
          />
        )}
        {page === 'settings' && (
          <SettingsPage
            settings={data.settings}
            trackers={trackers}
            activeTrackerId={activeTrackerId}
            entriesByTracker={data.entries}
            onUpdateSettings={(settings) => setData((prev) => ({ ...prev, settings }))}
            onUpdateTrackers={(nextTrackers) => setData((prev) => ({ ...prev, trackers: nextTrackers }))}
            onUpdateEntries={(entries) => setData((prev) => ({ ...prev, entries }))}
            onUpdateActiveTracker={(id) => setData((prev) => ({ ...prev, activeTrackerId: id }))}
            onUpdateProtocolRuns={(runs) => setData((prev) => ({ ...prev, protocolRuns: runs }))}
            onUpdateBadges={(badges) => setData((prev) => ({ ...prev, badges }))}
            onReplayOnboarding={() => {
              setOnboardingComplete(false)
              setShowOnboarding(true)
            }}
          />
        )}
      </main>
      <NavTabs active={page} onChange={setPage} />
      {activeBadge && <BadgeCelebration badge={activeBadge} onClose={() => setActiveBadge(null)} />}
    </div>
  )
}

export default App
