import { ReactNode } from 'react'

type ToggleProps = {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  right?: ReactNode
}

const Toggle = ({ label, description, checked, onChange, right }: ToggleProps) => (
  <label className="toggle-row">
    <span>
      <span className="toggle-label">{label}</span>
      {description && <span className="toggle-description">{description}</span>}
    </span>
    <span className="toggle-control">
      {right}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-pill" aria-hidden />
    </span>
  </label>
)

export default Toggle
