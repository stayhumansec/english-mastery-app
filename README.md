# English Mastery

A personal, single-user web app for taking yourself from A1 (beginner) to C2
(near-native) English, with a focus on practical usage and accent training.
It's a local-first PWA — everything is stored in your browser, there's no
backend, no accounts, and no cloud sync.

## Features

- **CEFR Roadmap** — an editable A1→C2 curriculum tracker. Add, edit, reorder
  and mark modules as not started / in progress / done, with per-level and
  overall progress bars.
- **Calendar** — month/week/day scheduling for study sessions, color-coded by
  activity type, with daily/weekday/weekly recurrence and one-tap completion.
- **Study Timer** — a configurable hours + minutes timer with start / pause /
  resume / reset, an optional break timer between sessions, and a filterable
  history of every logged session.
- **Flashcards** — six practical decks (Everyday Vocabulary, Idioms & Phrasal
  Verbs, Professional/Work English, Pronunciation Minimal Pairs, Sentence
  Patterns, Collocations) with a simple SM-2 spaced-repetition scheduler and
  again/hard/good/easy review grading. Add, edit and delete your own cards.
- **Accent & Pronunciation Log** — a lightweight structured log (date,
  activity, 1–5 self-rating, notes) for shadowing/pronunciation practice.
- **Dashboard** — today's scheduled sessions, flashcards due, current streak,
  overall CEFR progress, and quick-start shortcuts.
- **Reminders** — optional browser notifications for scheduled study times
  and an end-of-day nudge if nothing has been logged yet.
- Installable **PWA** that works offline.

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [Dexie.js](https://dexie.org) over IndexedDB for storage
- [react-big-calendar](https://github.com/jquense/react-big-calendar) +
  `date-fns` for the calendar view
- [react-router-dom](https://reactrouter.com) for client-side routing
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) for the service worker
  and installable manifest
- [lucide-react](https://lucide.dev) for icons

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build a production bundle to dist/
npm run preview   # preview the production build locally
npm run lint      # run oxlint
```

The app seeds itself on first run with the full A1–C2 roadmap skeleton and
~18 starter flashcards across all deck categories, so it isn't empty on
first launch. All data lives in IndexedDB (`english-mastery-db`) in your
browser — clearing site data will wipe your progress, so back up anything
irreplaceable (there's currently no export/import; see Roadmap below).

## Design notes & trade-offs

- **IndexedDB via Dexie, not localStorage.** localStorage is synchronous,
  capped at ~5–10MB, and stores strings only. Months of flashcard reviews,
  timer logs and recurring calendar sessions will comfortably outgrow that.
  Dexie gives async, indexed, structured storage with no realistic size
  ceiling for this use case.
- **SM-2, hand-rolled.** The algorithm is ~30 lines (`src/lib/sm2.ts`) and a
  well-understood, stable spec — pulling in a library would add a dependency
  for something trivial to own and easy to tune later.
- **Notification limitations.** Browser notifications here only fire while
  the app has an open tab or is running as an installed PWA window — there's
  no service-worker-driven background scheduling, since the Notification
  Triggers / Periodic Background Sync APIs this would need aren't reliably
  available across browsers. **iOS Safari** is the strictest case: web push
  requires the PWA to be added to the Home Screen first, and even then,
  scheduled (non-push) notifications while the app isn't open are not
  supported. Treat in-app reminders as a nice-to-have, not something to rely
  on for anything time-critical.
- **react-big-calendar** was used instead of a hand-built calendar grid — it
  handles month/week/day views, event layout and slot selection out of the
  box, which would otherwise be a significant chunk of throwaway UI code.

## Project structure

```
src/
  lib/            # storage (Dexie schema), types, SM-2, date/streak utils, notifications
  routes/          # top-level layout + nav
  components/      # small shared UI (progress bars, etc.)
  features/
    dashboard/     # home screen
    roadmap/       # CEFR roadmap tracker
    calendar/       # calendar + recurrence expansion
    timer/         # study timer + session history
    flashcards/    # decks, study session, card CRUD
    accent/        # accent/pronunciation log
    settings/      # reminder settings + the reminder-polling hook
```

Each feature folder is self-contained (its own page component(s)); shared
logic lives in `lib/`. This is meant to make it easy to keep extending —
e.g. a new feature is a new folder plus a route in `App.tsx`.

## Roadmap (possible future work)

- Export/import (JSON) for backup and moving between devices
- Optional cloud sync (v2)
- Push-based reminders via a real backend, if background reliability matters
  enough to justify one
