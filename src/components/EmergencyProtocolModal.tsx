import { useEffect, useMemo, useState } from 'react'
import { protocolSteps } from '../lib/protocol'
import { ProtocolRun } from '../lib/types'
import { playEmergencyStartSound, playProtocolCompleteSound } from '../lib/sounds'

type EmergencyProtocolModalProps = {
  trackerId: string
  isOpen: boolean
  onClose: () => void
  onStart: (run: ProtocolRun) => void
  onComplete: (runId: string, completedSteps: number) => void
  soundsEnabled: boolean
  hapticsEnabled: boolean
  createRun: (trackerId: string, durationMinutes: number) => ProtocolRun
}

const formatTimer = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

const EmergencyProtocolModal = ({
  trackerId,
  isOpen,
  onClose,
  onStart,
  onComplete,
  soundsEnabled,
  hapticsEnabled,
  createRun
}: EmergencyProtocolModalProps) => {
  const [stepChecks, setStepChecks] = useState<boolean[]>(() => protocolSteps.map(() => false))
  const [duration, setDuration] = useState(10)
  const [activeRun, setActiveRun] = useState<ProtocolRun | null>(null)
  const [remaining, setRemaining] = useState(duration * 60)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setStepChecks(protocolSteps.map(() => false))
    setDuration(10)
    setRemaining(10 * 60)
    setActiveRun(null)
    setIsCompleted(false)
  }, [isOpen])

  useEffect(() => {
    if (!activeRun || isCompleted) return
    const interval = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [activeRun, isCompleted])

  useEffect(() => {
    if (!activeRun || remaining > 0) return
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(120)
    }
  }, [activeRun, remaining, hapticsEnabled])

  const nextStep = useMemo(() => {
    const nextIndex = stepChecks.findIndex((checked) => !checked)
    return nextIndex >= 0 ? protocolSteps[nextIndex] : null
  }, [stepChecks])

  const handleToggleStep = (index: number) => {
    setStepChecks((prev) => prev.map((checked, idx) => (idx === index ? !checked : checked)))
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30)
    }
  }

  const handleStart = () => {
    const run = createRun(trackerId, duration)
    setActiveRun(run)
    setRemaining(duration * 60)
    onStart(run)
    if (soundsEnabled) playEmergencyStartSound()
  }

  const handleComplete = () => {
    if (!activeRun) return
    const completedSteps = stepChecks.filter(Boolean).length
    onComplete(activeRun.id, completedSteps)
    setIsCompleted(true)
    if (soundsEnabled) playProtocolCompleteSound()
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60, 40, 60])
    }
  }

  if (!isOpen) return null

  return (
    <div className="protocol-overlay" role="dialog" aria-modal="true" aria-label="Emergency protocol">
      <div className="protocol-modal">
        <header className="protocol-header">
          <div>
            <p className="eyebrow">Emergency Protocol</p>
            <h2>Get out of the loop</h2>
            <p className="subtle">Short steps to shift momentum and keep you steady.</p>
          </div>
          <button type="button" className="ghost tiny-button" onClick={onClose}>
            Close
          </button>
        </header>

        {!activeRun && (
          <div className="protocol-start card">
            <h3>Start Protocol</h3>
            <p className="subtle">Set a focus timer and move through each step.</p>
            <div className="timer-controls">
              <button type="button" className="ghost" onClick={() => setDuration((prev) => Math.max(5, prev - 5))}>
                −5 min
              </button>
              <div className="timer-display">
                <span>{duration} min focus</span>
              </div>
              <button type="button" className="ghost" onClick={() => setDuration((prev) => Math.min(30, prev + 5))}>
                +5 min
              </button>
            </div>
            <button type="button" className="primary" onClick={handleStart}>
              Start Protocol
            </button>
          </div>
        )}

        {activeRun && !isCompleted && (
          <div className="protocol-body">
            <div className="protocol-timer card">
              <div className="timer-status">
                <span className="timer-label">Focus timer</span>
                <strong>{formatTimer(remaining)}</strong>
              </div>
              {remaining === 0 ? (
                <p className="subtle">Timer complete. Keep checking steps when you can.</p>
              ) : (
                <p className="subtle">You’ve got this. One step at a time.</p>
              )}
              {nextStep && <div className="next-step">Next: {nextStep.title}</div>}
            </div>

            <div className="protocol-steps card">
              <h3>Checklist</h3>
              <div className="steps-grid">
                {protocolSteps.map((step, index) => (
                  <button
                    type="button"
                    key={step.id}
                    className={`step-card ${stepChecks[index] ? 'checked' : ''}`}
                    onClick={() => handleToggleStep(index)}
                  >
                    <div className="step-header">
                      <span className="step-title">{step.title}</span>
                      <span className="step-check">{stepChecks[index] ? '✓' : '○'}</span>
                    </div>
                    <p className="subtle">{step.caption}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="protocol-actions">
              <button type="button" className="ghost" onClick={onClose}>
                Quick exit
              </button>
              <button type="button" className="primary" onClick={handleComplete}>
                I’m safe now
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="protocol-complete card">
            <h3>Protocol saved</h3>
            <p className="subtle">You showed up for yourself. That counts.</p>
            <div className="badge">Protocol Save • Today</div>
            <button type="button" className="primary" onClick={onClose}>
              Return to Today
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmergencyProtocolModal
