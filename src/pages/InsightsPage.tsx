import { Entry } from '../lib/types'
import { calculateStats } from '../lib/scoring'

const InsightsPage = ({ entries }: { entries: Entry[] }) => {
  const stats = calculateStats(entries)
  const totalLast30 = stats.last30.green + stats.last30.yellow + stats.last30.red
  const totalLast7 = stats.last7.green + stats.last7.yellow + stats.last7.red

  const barWidth = (count: number, total: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100)

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Insights</p>
        <h1>Momentum snapshot</h1>
        <p className="subtle">Progress stays even when a day is red.</p>
      </header>

      <div className="card">
        <h3>Last 30 days</h3>
        <p className="subtle">You logged {stats.loggedLast30} of the last 30 days.</p>
        <div className="chart">
          <div className="chart-row green" style={{ width: `${barWidth(stats.last30.green, totalLast30)}%` }}>
            Green {stats.last30.green}
          </div>
          <div className="chart-row yellow" style={{ width: `${barWidth(stats.last30.yellow, totalLast30)}%` }}>
            Yellow {stats.last30.yellow}
          </div>
          <div className="chart-row red" style={{ width: `${barWidth(stats.last30.red, totalLast30)}%` }}>
            Red {stats.last30.red}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>This week</h3>
        <div className="stat-grid">
          <div>
            <span className="stat-value">{totalLast7}</span>
            <span className="stat-label">Days logged</span>
          </div>
          <div>
            <span className="stat-value">{stats.loggingStreak}</span>
            <span className="stat-label">Logging streak</span>
          </div>
          <div>
            <span className="stat-value">{stats.currentGreenStreak}</span>
            <span className="stat-label">Green streak</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Momentum score</h3>
        <p className="score">{stats.momentumScore}</p>
        <p className="subtle">Green = +3, Yellow = +1, Red = 0. Chain bonus rewards consecutive greens.</p>
      </div>

      <div className="card">
        <h3>Best streaks</h3>
        <div className="stat-grid">
          <div>
            <span className="stat-value">{stats.bestGreenStreakEver}</span>
            <span className="stat-label">Best green streak</span>
          </div>
          <div>
            <span className="stat-value">{stats.bestLoggingStreak}</span>
            <span className="stat-label">Best logging streak</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InsightsPage
