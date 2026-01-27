import { ReactNode } from 'react'

type ProgressBarProps = {
  label: string
  value: number
  target: number
  helper: string
  unit?: string
  accent?: 'green' | 'yellow' | 'red' | 'blue'
  extra?: ReactNode
}

const ProgressBar = ({ label, value, target, helper, unit = '', accent = 'green', extra }: ProgressBarProps) => {
  const percent = target ? Math.min(value / target, 1) * 100 : 0
  return (
    <div className="progress-row">
      <div className="progress-header">
        <div>
          <span className="progress-label">{label}</span>
          <span className="progress-helper">{helper}</span>
        </div>
        <div className="progress-value">
          {value}/{target} {unit}
        </div>
      </div>
      <div className="progress-bar" aria-hidden>
        <div className={`progress-fill ${accent}`} style={{ width: `${percent}%` }} />
      </div>
      {extra}
    </div>
  )
}

export default ProgressBar
