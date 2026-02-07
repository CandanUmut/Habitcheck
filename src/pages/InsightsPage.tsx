import DonutChart from '../components/DonutChart'
import LineChart from '../components/LineChart'
import StatsCards from '../components/StatsCards'
import BadgeGrid from '../components/BadgeGrid'
import ProgressBar from '../components/ProgressBar'
import { BadgesState, Entry, ProtocolRun, Tracker } from '../lib/types'
import { buildWeeklyGoalTimeline, calculateGoalProgress, calculateStats } from '../lib/scoring'
import { formatDate, lastNDays } from '../lib/dates'
import { getCompletedProtocolRunsInRange } from '../lib/protocol'
import { getBadgeDefinitions } from '../lib/badges'
import { getGoalModeLabel, getGoalUnitLabel } from '../lib/goals'
import { getStatusLabel } from '../lib/status'

const InsightsPage = ({
  entries,
  tracker,
  trackerId,
  protocolRuns,
  badges
}: {
  entries: Entry[]
  tracker: Tracker
  trackerId: string
  protocolRuns: ProtocolRun[]
  badges: BadgesState
}) => {
  const trackerRuns = protocolRuns.filter((run) => run.trackerId === trackerId)
  const stats = calculateStats(entries, trackerRuns)
  const last30Days = lastNDays(30)
  const last30Set = new Set(last30Days.map((date) => formatDate(date)))
  const entriesLast30 = entries.filter((entry) => last30Set.has(entry.date))
  const protocolRecent = getCompletedProtocolRunsInRange(protocolRuns, trackerId, 30)
  const protocolDays = new Set(protocolRecent.map((run) => run.date))
  const protocolEntries = entriesLast30.filter((entry) => protocolDays.has(entry.date))
  const goalProgress = calculateGoalProgress(
    entries,
    trackerRuns,
    tracker.goalMode,
    tracker.weeklyTarget,
    tracker.monthlyTarget
  )
  const goalTimeline = buildWeeklyGoalTimeline(entries, trackerRuns, tracker.goalMode, 8)
  const mostCommonStatus = (() => {
    const counts = stats.last30
    const pairs: { status: 'green' | 'yellow' | 'red'; count: number }[] = [
      { status: 'green', count: counts.green },
      { status: 'yellow', count: counts.yellow },
      { status: 'red', count: counts.red }
    ]
    return pairs.sort((a, b) => b.count - a.count)[0]
  })()
  const last30Total = stats.last30.green + stats.last30.yellow + stats.last30.red
  const last30AllGoodRate = last30Total ? Math.round((stats.last30.green / last30Total) * 100) : 0
  const last30MixedRate = last30Total ? Math.round((stats.last30.yellow / last30Total) * 100) : 0
  const last30ResetRate = last30Total ? Math.round((stats.last30.red / last30Total) * 100) : 0
  const weeklyAvgPoints = Number((stats.momentumWeekly / 7).toFixed(1))
  const monthlyAvgPoints = Number((stats.momentumMonthly / 30).toFixed(1))
  const weeklyHelper =
    goalProgress.weekly.remaining <= 0
      ? 'Weekly goal hit 🎉'
      : `${goalProgress.weekly.remaining} ${getGoalUnitLabel(tracker.goalMode)} left to hit your weekly goal`
  const monthlyHelper =
    goalProgress.monthly.remaining <= 0
      ? 'Monthly goal hit 🎉'
      : `${goalProgress.monthly.remaining} ${getGoalUnitLabel(tracker.goalMode)} left to hit your monthly goal`
  const trackerBadges = badges.trackers[trackerId] ?? []
  const globalBadges = badges.global ?? []
  const badgeDefinitions = getBadgeDefinitions('tracker')
  const globalDefinitions = getBadgeDefinitions('global')
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
        <h1>{tracker.name}</h1>
        <p className="subtle">Progress stays even on reset days.</p>
      </header>

      <div className="card">
        <h3>30-day snapshot</h3>
        <p className="summary-line">
          Last 30 days: {stats.loggedLast30}/30 logged · {last30AllGoodRate}% all-good
        </p>
        <StatsCards
          items={[
            {
              label: 'Most common status',
              value: `${getStatusLabel(mostCommonStatus.status)} (${mostCommonStatus.count})`
            },
            { label: 'Logging consistency', value: `${stats.consistencyMonthly}%` },
            { label: 'Avg points/day', value: `${monthlyAvgPoints} pts` },
            { label: 'Protocol saves (30d)', value: protocolRecent.length }
          ]}
        />
        <p className="subtle">
          Breakdown: {last30AllGoodRate}% all-good · {last30MixedRate}% mixed · {last30ResetRate}% reset days.
        </p>
      </div>

      <div className="card">
        <h3>Goal progress</h3>
        <p className="subtle">Goal mode: {getGoalModeLabel(tracker.goalMode)}</p>
        <div className="progress-grid">
          <ProgressBar
            label="Weekly target"
            value={goalProgress.weekly.current}
            target={goalProgress.weekly.target}
            helper={weeklyHelper}
            unit={getGoalUnitLabel(tracker.goalMode, true)}
            accent="green"
          />
          <ProgressBar
            label="Monthly target"
            value={goalProgress.monthly.current}
            target={goalProgress.monthly.target}
            helper={monthlyHelper}
            unit={getGoalUnitLabel(tracker.goalMode, true)}
            accent="yellow"
          />
        </div>
        <div className="chart-block full">
          <h4>Goal progress timeline (last 8 weeks)</h4>
          <LineChart values={goalTimeline} height={140} />
        </div>
        <p className="subtle">
          All good = +3, Mixed day = +1, Reset day = 0. Protocol recovery adds +1 per day. Chain bonus
          rewards consecutive all-good days.
        </p>
      </div>

      <div className="card insights-grid">
        <div className="chart-block">
          <h3>Last 7 days</h3>
          <DonutChart counts={stats.last7} />
          <p className="subtle chart-meta">
            {stats.loggedLast7}/7 logged · {stats.consistencyWeekly}% consistency.
          </p>
        </div>
        <div className="chart-block">
          <h3>Last 30 days</h3>
          <DonutChart counts={stats.last30} />
          <p className="subtle chart-meta">
            {last30AllGoodRate}% all-good · {stats.consistencyMonthly}% consistency.
          </p>
        </div>
        <div className="chart-block full">
          <h3>30-day points trend</h3>
          <LineChart values={stats.dailyScores} height={160} />
          <p className="subtle chart-meta">Weekly momentum: {stats.momentumWeekly} pts · Avg/day {weeklyAvgPoints} pts.</p>
        </div>
      </div>

      <div className="card scorecard-card">
        <h3>30-day scorecard</h3>
        <div className="scorecard-grid">
          <div>
            <span className="stat-value">{stats.loggedLast30}</span>
            <span className="stat-label">Days logged</span>
          </div>
          <div>
            <span className="stat-value">{stats.consistencyMonthly}%</span>
            <span className="stat-label">Logged days %</span>
          </div>
          <div>
            <span className="stat-value">{Number((stats.momentumMonthly / 30).toFixed(1))}</span>
            <span className="stat-label">Avg points/day</span>
          </div>
          <div>
            <span className="stat-value">{stats.bestGreenStreak}</span>
            <span className="stat-label">Best all-good streak</span>
          </div>
          <div>
            <span className="stat-value">{stats.bestLoggingStreak}</span>
            <span className="stat-label">Best logging streak</span>
          </div>
        </div>
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
            Protocol days were reset days {protocolRedRate}% of the time vs {totalRedRate}% overall. Every
            run is a step toward steadier days.
          </p>
        ) : (
          <p className="subtle">Use the protocol when you need a reset. It will show up here.</p>
        )}
      </div>

      <div className="card">
        <h3>Badges</h3>
        <BadgeGrid title="This tracker" definitions={badgeDefinitions} earned={trackerBadges} />
        <BadgeGrid title="Across all trackers" definitions={globalDefinitions} earned={globalBadges} />
      </div>
    </section>
  )
}

export default InsightsPage
