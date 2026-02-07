import { SummaryCounts } from '../lib/scoring'

const COLORS = {
  green: 'var(--green)',
  yellow: 'var(--yellow)',
  red: 'var(--red)'
}

type DonutChartProps = {
  counts: SummaryCounts
  size?: number
  strokeWidth?: number
}

const DonutChart = ({ counts, size = 120, strokeWidth = 18 }: DonutChartProps) => {
  const total = counts.green + counts.yellow + counts.red
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const segments = [
    { key: 'green', value: counts.green },
    { key: 'yellow', value: counts.yellow },
    { key: 'red', value: counts.red }
  ].filter((segment) => segment.value > 0)

  let offset = 0
  return (
    <div className="donut-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment) => {
          const length = total === 0 ? 0 : (segment.value / total) * circumference
          const dashArray = `${length} ${circumference - length}`
          const dashOffset = -offset
          offset += length
          return (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS[segment.key as keyof typeof COLORS]}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="donut-center">
        <span className="donut-total">{total}</span>
        <span className="donut-label">days</span>
      </div>
    </div>
  )
}

export default DonutChart
