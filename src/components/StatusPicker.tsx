import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Status, statusMeta } from '../lib/status'

type StatusPickerProps = {
  value: Status | null
  onChange: (status: Status) => void
  size?: 'large' | 'medium'
  variant?: 'full' | 'compact'
  requireHoldForRed?: boolean
  redHoldDurationMs?: number
}

const StatusPicker = ({
  value,
  onChange,
  size = 'large',
  variant = 'full',
  requireHoldForRed = false,
  redHoldDurationMs = 520
}: StatusPickerProps) => {
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const holdStartRef = useRef<number | null>(null)
  const holdRafRef = useRef<number | null>(null)
  const holdTriggeredRef = useRef(false)

  const statuses = useMemo(() => Object.keys(statusMeta) as Status[], [])

  const clearHold = useCallback(() => {
    if (holdRafRef.current !== null) {
      cancelAnimationFrame(holdRafRef.current)
    }
    holdStartRef.current = null
    holdTriggeredRef.current = false
    setHoldProgress(0)
    setIsHolding(false)
  }, [])

  useEffect(() => {
    return () => clearHold()
  }, [clearHold])

  const startHold = useCallback(() => {
    holdStartRef.current = performance.now()
    holdTriggeredRef.current = false
    setIsHolding(true)
    const tick = (now: number) => {
      if (!holdStartRef.current) return
      const progress = Math.min((now - holdStartRef.current) / redHoldDurationMs, 1)
      setHoldProgress(progress)
      if (progress >= 1 && !holdTriggeredRef.current) {
        holdTriggeredRef.current = true
        onChange('red')
        window.setTimeout(() => {
          clearHold()
        }, 120)
        return
      }
      holdRafRef.current = requestAnimationFrame(tick)
    }
    holdRafRef.current = requestAnimationFrame(tick)
  }, [clearHold, onChange, redHoldDurationMs])

  return (
    <div className={`status-selector ${size} ${variant}`}>
      {statuses.map((status) => {
        const isSelected = value === status
        const requiresHold = requireHoldForRed && status === 'red'
        return (
          <button
            key={status}
            type="button"
            className={`status-button ${status} ${isSelected ? 'selected' : ''} ${
              requiresHold ? 'requires-hold' : ''
            }`}
            onClick={
              requiresHold
                ? (event) => {
                    event.preventDefault()
                  }
                : () => onChange(status)
            }
            onPointerDown={requiresHold ? startHold : undefined}
            onPointerUp={requiresHold ? clearHold : undefined}
            onPointerLeave={requiresHold ? clearHold : undefined}
            onPointerCancel={requiresHold ? clearHold : undefined}
            onKeyDown={
              requiresHold
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onChange('red')
                    }
                  }
                : undefined
            }
            aria-pressed={isSelected}
            aria-label={requiresHold ? `${statusMeta[status].label}, hold to confirm` : statusMeta[status].label}
          >
            {requiresHold && (isHolding || holdProgress > 0) && (
              <span
                className="status-hold-ring"
                style={{ ['--hold-progress' as string]: `${holdProgress * 100}%` }}
                aria-hidden
              />
            )}
            {isSelected && (
              <span className="status-check" aria-hidden>
                ✓
              </span>
            )}
            <span className="status-icon" aria-hidden>
              {statusMeta[status].icon}
            </span>
            <span className="status-title">{statusMeta[status].label}</span>
            {variant === 'full' && <span className="status-subtitle">{statusMeta[status].helper}</span>}
            {requiresHold && (
              <span className="status-hold-label">{isHolding ? 'Keep holding…' : 'Hold to confirm'}</span>
            )}
            {isSelected && <span className="sr-only">Selected</span>}
          </button>
        )
      })}
    </div>
  )
}

export default StatusPicker
