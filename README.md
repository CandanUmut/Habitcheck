# G/Y/R Daily Tracker (v2)

A private, offline-first habit tracker built with React + Vite. Track multiple goals with Green/Yellow/Red check-ins, daily insights, and gentle momentum charts. Everything lives in your browser’s localStorage.

## Features
- Fast daily logging in under five seconds.
- Multi-tracker tabs with per-goal history.
- Optional daily reflection question per tracker.
- Home insights with streaks, 7/30-day breakdowns, and charts.
- Supportive quotes that refresh daily or on tap.
- Detailed insights page with donut and line charts.
- Calendar history editing with tap-to-edit days.
- Dark mode, sound effects, and gentle haptics toggles.
- Export/Import JSON backups.

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

## Export / Import
- **Export** creates a JSON file containing settings, trackers, and entries.
- **Import** accepts that JSON file to restore data on another device.

## GitHub Pages deployment
This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. It builds the Vite app and deploys to GitHub Pages on every push to `main`.

> Note: The Vite config sets `base: '/Habitcheck/'`, matching the repository name. If you fork or rename the repo, update `vite.config.ts` accordingly.
