import DonutChart from '../components/DonutChart'
import LineChart from '../components/LineChart'
import StatsCards from '../components/StatsCards'
import { Entry, ProtocolRun } from '../lib/types'
import { calculateStats } from '../lib/scoring'
import { formatDate, lastNDays } from '../lib/dates'
import { getCompletedProtocolRunsInRange } from '../lib/protocol'

const InsightsPage = ({
  entries,
  trackerName,
  trackerId,
  protocolRuns
}: {
  entries: Entry[]
  trackerName: string
  trackerId: string
  protocolRuns: ProtocolRun[]
}) => {
  const stats = calculateStats(entries)
  const last30Days = lastNDays(30)
  const last30Set = new Set(last30Days.map((date) => formatDate(date)))
  const entriesLast30 = entries.filter((entry) => last30Set.has(entry.date))
  const protocolRecent = getCompletedProtocolRunsInRange(protocolRuns, trackerId, 30)
  const protocolDays = new Set(protocolRecent.map((run) => run.date))
  const protocolEntries = entriesLast30.filter((entry) => protocolDays.has(entry.date))
  const totalRedRate = entriesLast30.length
    ? Math.round((entriesLast30.filter((entry) => entry.status === 'red').length / entriesLast30.length) * 100)
    : 0
  const protocolRedRate = protocolEntries.length
    ? Math.round((protocolEntries.filter((entry) => entry.status === 'red').length / protocolEntries.length) * 100)
    : 0

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
        <h3>Emergency Protocol</h3>
        <StatsCards
          items={[
            { label: 'Used last 30 days', value: protocolRecent.length },
            { label: 'Protocol days logged', value: protocolEntries.length }
          ]}
        />
        {protocolRecent.length > 0 ? (
          <p className="subtle">
            Protocol days were red {protocolRedRate}% of the time vs {totalRedRate}% overall. Every run
            is a step toward steadier days.
          </p>
        ) : (
          <p className="subtle">Use the protocol when you need a reset. It will show up here.</p>
        )}
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
