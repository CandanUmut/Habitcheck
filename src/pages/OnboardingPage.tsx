import { useMemo, useState } from 'react'
import Toggle from '../components/Toggle'
import { createTracker } from '../lib/storage'
import { Tracker } from '../lib/types'
import AppIcon from '../components/AppIcon'

type OnboardingPageProps = {
  tracker?: Tracker
  onComplete: (tracker: Tracker) => void
  onSkip: () => void
}

const OnboardingPage = ({ tracker, onComplete, onSkip }: OnboardingPageProps) => {
  const [goalName, setGoalName] = useState(tracker?.name ?? '')
  const [dailyQuestionEnabled, setDailyQuestionEnabled] = useState(tracker?.dailyQuestionEnabled ?? false)
  const [dailyQuestionText, setDailyQuestionText] = useState(
    tracker?.dailyQuestionText ?? 'What made today easier or harder?'
  )
  const [step, setStep] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const steps = useMemo(
    () => [
      'Welcome',
      'Choose a tracker',
      'How to log',
      'Emergency Protocol',
      'Done'
    ],
    []
  )

  const handleComplete = () => {
    if (!goalName.trim()) {
      setStep(1)
      return
    }
    const createdTracker = tracker ? { ...tracker, name: goalName.trim() } : createTracker(goalName.trim())
    createdTracker.dailyQuestionEnabled = dailyQuestionEnabled
    createdTracker.dailyQuestionText = dailyQuestionText.trim() || createdTracker.dailyQuestionText
    onComplete(createdTracker)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    handleComplete()
  }

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1))
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0))

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStart(event.touches[0]?.clientX ?? null)
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = event.changedTouches[0]?.clientX ?? touchStart
    const delta = touchStart - touchEnd
    if (delta > 50) handleNext()
    if (delta < -50) handlePrev()
    setTouchStart(null)
  }

  return (
    <section
      className="page onboarding"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="page-header">
        <div className="onboarding-progress">
          <p className="eyebrow">Onboarding</p>
          <div className="progress-dots">
            {steps.map((label, index) => (
              <span key={label} className={`dot ${index === step ? 'active' : ''}`} />
            ))}
          </div>
          <p className="subtle">
            Step {step + 1} of {steps.length}
          </p>
        </div>
        <button type="button" className="ghost tiny-button" onClick={onSkip}>
          Skip
        </button>
      </header>

      {step === 0 && (
        <div className="card onboarding-card">
          <AppIcon size={72} />
          <h1>Habitcheck</h1>
          <p className="subtle">Track your goal daily with three gentle statuses. Private. Simple.</p>
          <button type="button" className="primary" onClick={handleNext}>
            Get started
          </button>
        </div>
      )}

      {step === 1 && (
        <form className="card onboarding-card" onSubmit={handleSubmit}>
          <h1>Choose your first tracker</h1>
          <label className="field">
            <span>Goal name</span>
            <input
              autoFocus
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
              placeholder="Ex: No scrolling after 9pm"
              required
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

          <div className="onboarding-actions">
            <button type="button" className="ghost" onClick={handlePrev}>
              Back
            </button>
            <button type="submit" className="primary" disabled={!goalName.trim()}>
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="card onboarding-card">
          <h1>How to log</h1>
          <div className="status-explainer">
            <div>
              <strong className="green">All good</strong>
              <p className="subtle">Aligned with my goal.</p>
            </div>
            <div>
              <strong className="yellow">Mixed day</strong>
              <p className="subtle">Some friction, still showing up.</p>
            </div>
            <div>
              <strong className="red">Reset day</strong>
              <p className="subtle">Not my day. Reset is data, not shame.</p>
            </div>
          </div>
          <div className="onboarding-actions">
            <button type="button" className="ghost" onClick={handlePrev}>
              Back
            </button>
            <button type="button" className="primary" onClick={handleNext}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card onboarding-card">
          <h1>Emergency Protocol</h1>
          <p className="subtle">
            When you feel an urge or risk, tap Emergency to open a guided checklist and timer.
          </p>
          <div className="onboarding-actions">
            <button type="button" className="ghost" onClick={handlePrev}>
              Back
            </button>
            <button type="button" className="primary" onClick={handleNext}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card onboarding-card">
          <h1>Ready to start?</h1>
          <p className="subtle">Log daily and let the insights help you stay on track.</p>
          <button type="button" className="primary" onClick={handleComplete}>
            Start Today
          </button>
        </div>
      )}
    </section>
  )
}

export default OnboardingPage
