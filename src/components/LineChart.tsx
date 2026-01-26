const buildPoints = (values: number[], width: number, height: number, padding: number): string => {
  if (values.length === 0) return ''
  const max = Math.max(...values, 1)
  const stepX = (width - padding * 2) / Math.max(values.length - 1, 1)
  return values
    .map((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - (value / max) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

type LineChartProps = {
  values: number[]
  height?: number
}

const LineChart = ({ values, height = 120 }: LineChartProps) => {
  const width = 320
  const padding = 16
  const points = buildPoints(values, width, height, padding)

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" />
      </svg>
    </div>
  )
}

export default LineChart
