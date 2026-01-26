import DonutChart from '../components/DonutChart'
import LineChart from '../components/LineChart'
import StatsCards from '../components/StatsCards'
import { Entry } from '../lib/types'
import { calculateStats } from '../lib/scoring'

const InsightsPage = ({ entries, trackerName }: { entries: Entry[]; trackerName: string }) => {
  const stats = calculateStats(entries)

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Insights</p>
        <h1>{trackerName}</h1>
        <p className="subtle">Progress stays even when a day is red.</p>
      </header>

      <div className="card insights-grid">
        <div className="chart-block">
          <h3>Last 7 days</h3>
          <DonutChart counts={stats.last7} />
        </div>
        <div className="chart-block">
          <h3>Last 30 days</h3>
          <DonutChart counts={stats.last30} />
        </div>
        <div className="chart-block full">
          <h3>30-day momentum</h3>
          <LineChart values={stats.dailyScores} height={160} />
        </div>
      </div>

      <div className="card">
        <h3>Stats</h3>
        <StatsCards
          items={[
            { label: 'Best green streak', value: stats.bestGreenStreak },
            { label: 'Current green streak', value: stats.currentGreenStreak },
            { label: 'Logging streak', value: stats.loggingStreak },
            { label: 'Completion rate', value: `${stats.consistencyMonthly}%` }
          ]}
        />
      </div>

      <div className="card">
        <h3>Momentum scores</h3>
        <StatsCards
          items={[
            { label: 'Weekly momentum', value: stats.momentumWeekly },
            { label: 'Monthly momentum', value: stats.momentumMonthly },
            { label: 'Consistency (7d)', value: `${stats.consistencyWeekly}%` },
            { label: 'Consistency (30d)', value: `${stats.consistencyMonthly}%` }
          ]}
        />
        <p className="subtle">Green = +3, Yellow = +1, Red = 0. Chain bonus rewards consecutive greens.</p>
      </div>
    </section>
  )
}

export default InsightsPage
