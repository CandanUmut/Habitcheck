import { useEffect, useMemo, useState } from 'react'
import NavTabs, { PageKey } from './components/NavTabs'
import TrackerTabs from './components/TrackerTabs'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'
import { createTracker, loadAppData, saveAppData } from './lib/storage'
import { AppData, Entry, Status, Tracker } from './lib/types'
import { todayString } from './lib/dates'

const App = () => {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [page, setPage] = useState<PageKey>('home')

  useEffect(() => {
    saveAppData(data)
  }, [data])

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
  }, [data.settings.theme])

  const trackers = data.trackers
  const activeTracker = useMemo(
    () => trackers.find((tracker) => tracker.id === data.activeTrackerId) ?? trackers[0],
    [trackers, data.activeTrackerId]
  )
  const activeTrackerId = activeTracker?.id
  const activeEntries = activeTrackerId ? data.entries[activeTrackerId] ?? [] : []

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

  if (trackers.length === 0) {
    return (
      <OnboardingPage
        onComplete={(tracker: Tracker) =>
          setData((prev) => ({
            ...prev,
            trackers: [tracker],
            entries: { ...prev.entries, [tracker.id]: [] },
            activeTrackerId: tracker.id
          }))
        }
      />
    )
  }

  return (
    <div className="app">
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
            settings={data.settings}
            onSave={(status, note) => updateEntry(activeTracker.id, todayString(), status, note)}
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
          <InsightsPage entries={activeEntries} trackerName={activeTracker.name} />
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
          />
        )}
      </main>
      <NavTabs active={page} onChange={setPage} />
    </div>
  )
}

export default App
