type StatItem = {
  label: string
  value: string | number
}

type StatsCardsProps = {
  items: StatItem[]
}

const StatsCards = ({ items }: StatsCardsProps) => (
  <div className="stats-cards">
    {items.map((item) => (
      <div key={item.label} className="stat-card">
        <span className="stat-value">{item.value}</span>
        <span className="stat-label">{item.label}</span>
      </div>
    ))}
  </div>
)

export default StatsCards
