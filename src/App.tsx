import { useEffect, useMemo, useState } from 'react'
import NavTabs, { PageKey } from './components/NavTabs'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'
import { loadEntries, loadSettings, saveEntries, saveSettings } from './lib/storage'
import { Entry, Settings, Status } from './lib/types'
import { todayString } from './lib/date'

const App = () => {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries())
  const [page, setPage] = useState<PageKey>('home')

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  const todayKey = todayString()
  const todayEntry = useMemo(() => entries.find((entry) => entry.date === todayKey), [entries, todayKey])

  const updateEntry = (date: string, status: Status, note: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((entry) => entry.date !== date)
      return [
        ...filtered,
        {
          date,
          status,
          note: note.trim() ? note.trim() : undefined,
          updatedAt: Date.now()
        }
      ]
    })
  }

  if (!settings.goalName) {
    return <OnboardingPage settings={settings} onComplete={setSettings} />
  }

  return (
    <div className="app">
      <main className="content">
        {page === 'home' && (
          <HomePage
            settings={settings}
            entry={todayEntry}
            onSave={(status, note) => updateEntry(todayKey, status, note)}
            isActive={page === 'home'}
            showNudge={!todayEntry}
          />
        )}
        {page === 'history' && <HistoryPage entries={entries} onSave={updateEntry} />}
        {page === 'insights' && <InsightsPage entries={entries} />}
        {page === 'settings' && (
          <SettingsPage
            settings={settings}
            entries={entries}
            onUpdateSettings={setSettings}
            onUpdateEntries={setEntries}
          />
        )}
      </main>
      <NavTabs active={page} onChange={setPage} />
    </div>
  )
}

export default App
