# G/Y/R Daily Tracker (v3)

A private, offline-first habit tracker built with React + Vite. Track multiple goals with Green/Yellow/Red check-ins, daily insights, and gentle momentum charts. Everything lives in your browser’s localStorage.

## Features
- Fast daily logging in under five seconds.
- Multi-tracker tabs with per-goal history.
- Optional daily reflection question per tracker.
- Home insights with streaks, 7/30-day breakdowns, and charts.
- Supportive quotes that refresh daily or on tap.
- Detailed insights page with donut and line charts.
- Calendar history editing with tap-to-edit days.
- Emergency Protocol checklist with focus timer and daily badge.
- Dark mode, sound effects, and gentle haptics toggles.
- Export/Import JSON backups.
- Installable PWA with offline-first support.

## Getting started

```bash
npm install
npm run dev
```

### Build for production

```bash
npm run build
npm run preview
```

## Privacy
All data is stored locally in your browser’s `localStorage`. There is no backend, no analytics, and no login.

## PWA install + offline use
- **Desktop (Chrome/Edge):** click the install icon in the address bar, or use the browser menu → “Install app”.
- **iOS Safari:** tap Share → “Add to Home Screen”.
- Once loaded, the app works offline (app shell + assets cached). You’ll see an “Offline mode” pill in the header when disconnected.

## Required assets (branding)
Add your square PNG icon at:
- `/public/assets/app-icon.png` (recommended 1024×1024)

Generate PWA icons after adding the file:

```bash
npm run generate:icons
```

This will create:
- `/public/pwa/icon-192.png`
- `/public/pwa/icon-512.png`
- `/public/pwa/apple-touch-icon.png`
- `/public/pwa/favicon-32x32.png`

## Optional assets
- Sounds (place in `/public/assets/sounds/`):
  - `success.mp3`
  - `neutral.mp3`
  - `gentle-alert.mp3`
  - `complete.mp3`
- Illustrations (optional): `/public/assets/illustrations/`

## Export / Import
- **Export** creates a JSON file containing settings, trackers, and entries.
- **Import** accepts that JSON file to restore data on another device.

## GitHub Pages deployment
This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. It builds the Vite app and deploys to GitHub Pages on every push to `main`.

> Note: The Vite config sets `base: '/Habitcheck/'`, matching the repository name. If you fork or rename the repo, update `vite.config.ts` accordingly.
