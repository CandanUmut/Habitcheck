# G/Y/R Daily Tracker

A private, offline-first habit tracker built with React + Vite. Log one daily goal using three states: Green, Yellow, or Red. Everything lives in your browser’s localStorage.

## Features
- Fast daily logging in under five seconds.
- Optional daily reflection question.
- Calendar history editing.
- Momentum insights with streaks and scores.
- Dark mode and sound toggles.
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
- **Export** creates a JSON file containing settings and entries.
- **Import** accepts that JSON file to restore data on another device.

## GitHub Pages deployment
This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. It builds the Vite app and deploys to GitHub Pages on every push to `main`.

> Note: The Vite config sets `base: '/Habitcheck/'`, matching the repository name. If you fork or rename the repo, update `vite.config.ts` accordingly.
