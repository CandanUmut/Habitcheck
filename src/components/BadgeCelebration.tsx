import { useEffect } from 'react'
import { Badge } from '../lib/types'

type BadgeCelebrationProps = {
  badge: Badge
  onClose: () => void
}

const BadgeCelebration = ({ badge, onClose }: BadgeCelebrationProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2200)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <div className="badge-celebration" role="dialog" aria-live="polite">
      <div className="badge-celebration-card">
        <span className="badge-celebration-icon" aria-hidden>
          {badge.icon}
        </span>
        <h3>Badge earned!</h3>
        <p className="badge-celebration-title">{badge.title}</p>
        <p className="subtle">{badge.description}</p>
        <button type="button" className="primary" onClick={onClose}>
          Nice!
        </button>
      </div>
    </div>
  )
}

export default BadgeCelebration
