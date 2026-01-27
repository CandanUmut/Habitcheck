import { Badge } from '../lib/types'
import { BadgeDefinition } from '../lib/badges'

type BadgeGridProps = {
  title: string
  definitions: BadgeDefinition[]
  earned: Badge[]
}

const BadgeGrid = ({ title, definitions, earned }: BadgeGridProps) => {
  const earnedMap = new Map(earned.map((badge) => [badge.id, badge]))
  return (
    <div className="badge-section">
      <h3>{title}</h3>
      <div className="badge-grid">
        {definitions.map((definition) => {
          const badge = earnedMap.get(definition.id)
          return (
            <div key={definition.id} className={`badge-card ${badge ? 'earned' : 'locked'}`}>
              <span className="badge-icon" aria-hidden>
                {definition.icon}
              </span>
              <div>
                <p className="badge-title">{definition.title}</p>
                <p className="subtle tiny">{definition.description}</p>
                {badge && <p className="badge-earned">Earned {badge.earnedAt}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BadgeGrid
