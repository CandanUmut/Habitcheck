import { useMemo, useRef, useState } from 'react'
import Toggle from '../components/Toggle'
import { AppSettings, Entry, ProtocolRun, Tracker } from '../lib/types'
import { createTracker, defaultSettings, exportData, importData, resetData } from '../lib/storage'
import { todayString } from '../lib/dates'

type SettingsPageProps = {
  settings: AppSettings
  trackers: Tracker[]
  activeTrackerId?: string
  entriesByTracker: Record<string, Entry[]>
  onUpdateSettings: (settings: AppSettings) => void
  onUpdateTrackers: (trackers: Tracker[]) => void
  onUpdateEntries: (entries: Record<string, Entry[]>) => void
  onUpdateActiveTracker: (id: string) => void
  onUpdateProtocolRuns: (runs: ProtocolRun[]) => void
  onReplayOnboarding: () => void
}

const SettingsPage = ({
  settings,
  trackers,
  activeTrackerId,
  entriesByTracker,
  onUpdateSettings,
  onUpdateTrackers,
  onUpdateEntries,
  onUpdateActiveTracker,
  onUpdateProtocolRuns,
  onReplayOnboarding
}: SettingsPageProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importError, setImportError] = useState('')
  const activeTracker = useMemo(
    () => trackers.find((tracker) => tracker.id === activeTrackerId) ?? trackers[0],
    [trackers, activeTrackerId]
  )

  const handleExport = () => {
    const payload = exportData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habitcheck-backup-${todayString()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ReturnType<typeof exportData>
        const imported = importData(parsed)
        onUpdateSettings(imported.settings)
        onUpdateTrackers(imported.trackers)
        onUpdateEntries(imported.entries)
        onUpdateProtocolRuns(imported.protocolRuns)
        onUpdateActiveTracker(imported.activeTrackerId ?? imported.trackers[0]?.id ?? '')
        setImportError('')
      } catch {
        setImportError('That file does not look like a valid backup.')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    const confirmed = window.confirm('Reset all local data? This cannot be undone.')
    if (!confirmed) return
    resetData()
    onUpdateSettings({ ...defaultSettings })
    onUpdateTrackers([])
    onUpdateEntries({})
    onUpdateActiveTracker('')
    onUpdateProtocolRuns([])
  }

  const handleAddTracker = () => {
    const name = window.prompt('Name your tracker')?.trim()
    if (!name) return
    const newTracker = createTracker(name)
    onUpdateTrackers([...trackers, newTracker])
    onUpdateEntries({ ...entriesByTracker, [newTracker.id]: [] })
    onUpdateActiveTracker(newTracker.id)
  }

  const handleRenameTracker = (id: string, name: string) => {
    onUpdateTrackers(
      trackers.map((tracker) => (tracker.id === id ? { ...tracker, name: name.trim() || tracker.name } : tracker))
    )
  }

  const handleDeleteTracker = (id: string) => {
    const tracker = trackers.find((item) => item.id === id)
    if (!tracker) return
    const confirmed = window.confirm(`Delete ${tracker.name}? This removes its history.`)
    if (!confirmed) return
    const nextTrackers = trackers.filter((item) => item.id !== id)
    const { [id]: _, ...nextEntries } = entriesByTracker
    onUpdateTrackers(nextTrackers)
    onUpdateEntries(nextEntries)
    onUpdateActiveTracker(nextTrackers[0]?.id ?? '')
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h1>Keep it simple</h1>
        <p className="subtle">Everything stays private in your browser.</p>
      </header>

      <div className="card">
        <h3>Trackers</h3>
        <div className="tracker-settings">
          {trackers.map((tracker) => (
            <div key={tracker.id} className="tracker-row">
              <input
                value={tracker.name}
                onChange={(event) => handleRenameTracker(tracker.id, event.target.value)}
              />
              <div className="tracker-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onUpdateActiveTracker(tracker.id)}
                >
                  {tracker.id === activeTrackerId ? 'Active' : 'Set active'}
                </button>
                <button type="button" className="ghost" onClick={() => handleDeleteTracker(tracker.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="ghost" onClick={handleAddTracker}>
          + Add tracker
        </button>
      </div>

      {activeTracker && (
        <div className="card">
          <h3>Daily question</h3>
          <Toggle
            label="Daily reflection"
            description="Show a quick reflection prompt after you choose a color."
            checked={activeTracker.dailyQuestionEnabled}
            onChange={(value) =>
              onUpdateTrackers(
                trackers.map((tracker) =>
                  tracker.id === activeTracker.id ? { ...tracker, dailyQuestionEnabled: value } : tracker
                )
              )
            }
          />
          {activeTracker.dailyQuestionEnabled && (
            <label className="field">
              <span>Daily question text</span>
              <input
                value={activeTracker.dailyQuestionText}
                onChange={(event) =>
                  onUpdateTrackers(
                    trackers.map((tracker) =>
                      tracker.id === activeTracker.id
                        ? { ...tracker, dailyQuestionText: event.target.value }
                        : tracker
                    )
                  )
                }
              />
            </label>
          )}
        </div>
      )}

      <div className="card">
        <h3>Preferences</h3>
        <Toggle
          label="Sound effects"
          description="Short sounds after you log a day."
          checked={settings.soundsEnabled}
          onChange={(value) => onUpdateSettings({ ...settings, soundsEnabled: value })}
        />

        <Toggle
          label="Haptics"
          description="Gentle vibrations on mobile after you log."
          checked={settings.hapticsEnabled}
          onChange={(value) => onUpdateSettings({ ...settings, hapticsEnabled: value })}
        />

        <Toggle
          label="Dark theme"
          description="Switch the background for low-light use."
          checked={settings.theme === 'dark'}
          onChange={(value) => onUpdateSettings({ ...settings, theme: value ? 'dark' : 'light' })}
        />
      </div>

      <div className="card">
        <h3>Onboarding</h3>
        <p className="subtle">Replay the intro walkthrough if you want a quick refresher.</p>
        <button type="button" className="ghost" onClick={onReplayOnboarding}>
          Replay onboarding
        </button>
      </div>

      <div className="card">
        <h3>Backup & restore</h3>
        <p className="subtle">Export JSON to keep a private backup or move devices.</p>
        <div className="button-row">
          <button type="button" className="ghost" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="ghost" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleImport(file)
            }}
          />
        </div>
        {importError && <p className="error">{importError}</p>}
      </div>

      <div className="card">
        <h3>Reset</h3>
        <p className="subtle">Clear all local data and start fresh.</p>
        <button type="button" className="danger" onClick={handleReset}>
          Reset data
        </button>
      </div>
    </section>
  )
}

export default SettingsPage
