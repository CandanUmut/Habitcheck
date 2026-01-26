import { useState } from 'react'
import Toggle from '../components/Toggle'
import { Settings } from '../lib/types'

type OnboardingPageProps = {
  settings: Settings
  onComplete: (settings: Settings) => void
}

const OnboardingPage = ({ settings, onComplete }: OnboardingPageProps) => {
  const [goalName, setGoalName] = useState(settings.goalName)
  const [dailyQuestionEnabled, setDailyQuestionEnabled] = useState(settings.dailyQuestionEnabled)
  const [dailyQuestionText, setDailyQuestionText] = useState(settings.dailyQuestionText)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!goalName.trim()) return
    onComplete({
      ...settings,
      goalName: goalName.trim(),
      dailyQuestionEnabled,
      dailyQuestionText: dailyQuestionText.trim() || settings.dailyQuestionText
    })
  }

  return (
    <section className="page onboarding">
      <header className="page-header">
        <p className="eyebrow">Welcome</p>
        <h1>Pick one goal for daily tracking.</h1>
        <p className="subtle">Your data stays on this device only.</p>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Goal name</span>
          <input
            autoFocus
            value={goalName}
            onChange={(event) => setGoalName(event.target.value)}
            placeholder="Ex: No scrolling after 9pm"
          />
        </label>

        <Toggle
          label="Add a daily question"
          description="Optional: a short prompt to reflect on your day."
          checked={dailyQuestionEnabled}
          onChange={setDailyQuestionEnabled}
        />
        {dailyQuestionEnabled && (
          <label className="field">
            <span>Daily question</span>
            <input
              value={dailyQuestionText}
              onChange={(event) => setDailyQuestionText(event.target.value)}
              placeholder="What helped me today?"
            />
          </label>
        )}

        <button type="submit" className="primary" disabled={!goalName.trim()}>
          Start tracking
        </button>
      </form>
    </section>
  )
}

export default OnboardingPage
