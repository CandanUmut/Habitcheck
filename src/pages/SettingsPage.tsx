import { useRef, useState } from 'react'
import Toggle from '../components/Toggle'
import { Entry, Settings } from '../lib/types'
import { defaultSettings, exportData, importData, resetData } from '../lib/storage'
import { todayString } from '../lib/date'

type SettingsPageProps = {
  settings: Settings
  entries: Entry[]
  onUpdateSettings: (settings: Settings) => void
  onUpdateEntries: (entries: Entry[]) => void
}

const SettingsPage = ({ settings, entries, onUpdateSettings, onUpdateEntries }: SettingsPageProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importError, setImportError] = useState('')

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
        const parsed = JSON.parse(String(reader.result)) as { settings?: Partial<Settings>; entries?: Entry[] }
        const imported = importData(parsed)
        onUpdateSettings(imported.settings)
        onUpdateEntries(imported.entries)
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
    onUpdateEntries([])
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h1>Keep it simple</h1>
        <p className="subtle">Everything stays private in your browser.</p>
      </header>

      <div className="card">
        <label className="field">
          <span>Goal name</span>
          <input
            value={settings.goalName}
            onChange={(event) => onUpdateSettings({ ...settings, goalName: event.target.value })}
            placeholder="Ex: No scrolling after 9pm"
          />
        </label>

        <Toggle
          label="Daily question"
          description="Show a quick reflection prompt after you choose a color."
          checked={settings.dailyQuestionEnabled}
          onChange={(value) => onUpdateSettings({ ...settings, dailyQuestionEnabled: value })}
        />
        {settings.dailyQuestionEnabled && (
          <label className="field">
            <span>Daily question text</span>
            <input
              value={settings.dailyQuestionText}
              onChange={(event) => onUpdateSettings({ ...settings, dailyQuestionText: event.target.value })}
            />
          </label>
        )}

        <label className="field">
          <span>Optional reminder time</span>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(event) => onUpdateSettings({ ...settings, reminderTime: event.target.value })}
          />
          <small className="subtle">We do not send notifications in v1, this is for a future nudge.</small>
        </label>

        <Toggle
          label="Sound effects"
          description="Short sounds after you log a day."
          checked={settings.soundsEnabled}
          onChange={(value) => onUpdateSettings({ ...settings, soundsEnabled: value })}
        />

        <Toggle
          label="Dark theme"
          description="Switch the background for low-light use."
          checked={settings.theme === 'dark'}
          onChange={(value) => onUpdateSettings({ ...settings, theme: value ? 'dark' : 'light' })}
        />
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
