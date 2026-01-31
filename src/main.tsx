import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

const BUILD_ID_KEY = 'habitcheck.buildId'
const STARTUP_FAILURES_KEY = 'habitcheck.startupFailures'
const STARTUP_CLEAR_DELAY_MS = 4000
const MAX_STARTUP_FAILURES = 2

const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore storage errors (private mode, denied, etc.)
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors (private mode, denied, etc.)
    }
  }
}

const buildId = typeof __APP_BUILD_ID__ === 'string' ? __APP_BUILD_ID__ : 'dev'

const readStartupFailures = (): number => {
  const value = safeStorage.get(STARTUP_FAILURES_KEY)
  const parsed = value ? Number.parseInt(value, 10) : 0
  return Number.isFinite(parsed) ? parsed : 0
}

const bumpStartupFailures = (): number => {
  const next = readStartupFailures() + 1
  safeStorage.set(STARTUP_FAILURES_KEY, String(next))
  return next
}

const clearStartupFailures = () => {
  safeStorage.remove(STARTUP_FAILURES_KEY)
}

const promptRefresh = (reload: () => void) => {
  if (typeof window === 'undefined') return
  const shouldReload = window.confirm('A new version is available. Refresh now?')
  if (shouldReload) reload()
}

const handleBuildMismatch = (reload: () => void) => {
  const previous = safeStorage.get(BUILD_ID_KEY)
  if (previous && previous !== buildId) {
    promptRefresh(reload)
  }
  safeStorage.set(BUILD_ID_KEY, buildId)
}

const handleRepeatedCrash = (reload: () => void) => {
  const failures = readStartupFailures()
  if (failures < MAX_STARTUP_FAILURES) return
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister()
      })
    })
    clearStartupFailures()
    return
  }
  promptRefresh(reload)
}

let updateServiceWorker: (reload?: boolean) => Promise<void> = async () => {}

updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    promptRefresh(() => {
      void updateServiceWorker(true)
    })
  }
})

handleBuildMismatch(() => {
  void updateServiceWorker(true)
})

handleRepeatedCrash(() => {
  void updateServiceWorker(true)
})

const markHealthy = () => {
  window.setTimeout(() => {
    clearStartupFailures()
  }, STARTUP_CLEAR_DELAY_MS)
}

const crashHandler = () => {
  const failures = bumpStartupFailures()
  if (failures >= MAX_STARTUP_FAILURES) {
    handleRepeatedCrash(() => {
      void updateServiceWorker(true)
    })
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', crashHandler)
  window.addEventListener('unhandledrejection', crashHandler)
  markHealthy()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
