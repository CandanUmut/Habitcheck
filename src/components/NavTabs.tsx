import { ReactNode } from 'react'

export type PageKey = 'home' | 'history' | 'insights' | 'settings'

type Tab = {
  key: PageKey
  label: string
  icon: ReactNode
}

const tabs: Tab[] = [
  { key: 'home', label: 'Today', icon: '●' },
  { key: 'history', label: 'History', icon: '▦' },
  { key: 'insights', label: 'Insights', icon: '◔' },
  { key: 'settings', label: 'Settings', icon: '⚙' }
]

type NavTabsProps = {
  active: PageKey
  onChange: (key: PageKey) => void
}

const NavTabs = ({ active, onChange }: NavTabsProps) => (
  <nav className="nav-tabs">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        className={`nav-tab ${active === tab.key ? 'active' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        <span className="nav-icon" aria-hidden>
          {tab.icon}
        </span>
        <span>{tab.label}</span>
      </button>
    ))}
  </nav>
)

export default NavTabs
