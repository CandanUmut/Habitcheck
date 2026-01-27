import { useState } from 'react'

type AppIconProps = {
  size?: number
  label?: string
}

const AppIcon = ({ size = 40, label = 'HC' }: AppIconProps) => {
  const [hasError, setHasError] = useState(false)
  const baseUrl = import.meta.env.BASE_URL

  return (
    <div className="app-icon" style={{ width: size, height: size }}>
      {hasError ? (
        <span className="app-icon-fallback" aria-hidden>
          {label}
        </span>
      ) : (
        <img
          src={`${baseUrl}assets/app-icon.png`}
          alt="App icon"
          width={size}
          height={size}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export default AppIcon
