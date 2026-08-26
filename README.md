# English Mastery

A personal, single-user web app for taking yourself from A1 (beginner) to C2
(near-native) English, with a focus on practical usage and accent training.
It's a local-first PWA — everything is stored in your browser, there's no
backend, no accounts, and no cloud sync.

## Features

- **CEFR Roadmap** — an editable A1→C2 curriculum tracker. Modules with
  written lesson content (all of A1 so far) open into a full guided lesson:
  a plain-language concept explanation, tagged examples, a "watch out for
  this" mistakes list, in-context practice (linked flashcards, a Sentence
  Production Drill, an embedded Spot the Pattern warm-up), and a mini-quiz —
  a lesson-backed module can only be marked done after passing its quiz
  (70%+). Modules within a level are lightly sequenced, with a "recommended
  after X" indicator. Modules without lesson content yet fall back to a
  "coming soon" shell with the original manual status dropdown. Per-level
  and overall progress bars throughout.
- **Calendar** — month/week/day scheduling for study sessions, color-coded by
  activity type, with daily/weekday/weekly recurrence and one-tap completion.
- **Study Timer** — a configurable hours + minutes timer with start / pause /
  resume / reset, an optional break timer between sessions, and a filterable
  history of every logged session.
- **Flashcards** — six practical decks (Everyday Vocabulary, Idioms & Phrasal
  Verbs, Professional/Work English, Pronunciation Minimal Pairs, Sentence
  Patterns, Collocations) with a simple SM-2 spaced-repetition scheduler and
  again/hard/good/easy review grading. Add, edit and delete your own cards.
- **Comprehensible Input Log** — log what you read/listened to (title,
  type, difficulty, duration) with 2–3 new words/phrases per entry and a
  one-click "send to flashcards" so real input feeds spaced repetition.
  Tracks weekly input minutes and a separate weekly streak.
- **Writing Journal** — a daily free-write with word count and streak
  tracking, optionally tagged with the grammar pattern or vocabulary you
  deliberately tried to use. Output practice, not grammar recognition.
- **Speaking & Accent Log** — a leveled scenario-prompt generator
  (everyday/professional/storytelling/debate) with a simple practice timer
  (no audio recorded), self-rating, notes, and category coverage so gaps in
  speaking practice are visible.
- **Sentence Production Drills** — short daily sessions (4 sentences):
  pairs a grammar pattern with a realistic scenario and asks for a
  free-written sentence. Attempts are marked confident/unsure; unsure ones
  resurface in later sessions.
- **Pattern Library** — a browsable, searchable, filterable library of
  grammar patterns (A1–B2) with color-coded structure templates and
  highlighted example sentences (subject/verb/object, consistent across all
  patterns), a common-mistake note, a contrast example, and a "Spot the
  Pattern" recognition warm-up with immediate visual feedback. Links to
  Grammar-in-Context flashcards and focused Sentence Drills sessions.
- **Weekly Practical Skill Focus** — rotates through your in-progress
  roadmap modules to spotlight one practical focus per week, with related
  Pattern Library entries surfaced on the dashboard.
- **Dashboard** — a "Continue learning" quick-action that always points at
  your next not-done lesson, a daily practice checklist (input log, journal,
  sentence drill, today's speaking prompt), flashcards due, today's
  scheduled sessions, current streak, and overall CEFR progress.
- **Reminders** — optional browser notifications for scheduled study times
  and an end-of-day nudge if nothing has been logged yet.
- Installable **PWA** that works offline.
- A light, colorful, Duolingo-style design system — bright per-feature/
  per-level colors, rounded cards and pill buttons, and springy Framer
  Motion animation throughout (page transitions, count-up stats, a real
  3D flashcard flip, confetti bursts on milestones), with a
  `prefers-reduced-motion` fallback.

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [Framer Motion](https://motion.dev) for animation (page transitions,
  count-up numbers, spring-animated progress bars, the flashcard flip,
  confetti, toasts, modals — see `src/components/motion/`)
- [Dexie.js](https://dexie.org) over IndexedDB for storage
- [react-big-calendar](https://github.com/jquense/react-big-calendar) +
  `date-fns` for the calendar view
- [react-router-dom](https://reactrouter.com) for client-side routing
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) for the service worker
  and installable manifest
- [lucide-react](https://lucide.dev) for icons
- [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts) for the
  rounded, friendly typeface

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build a production bundle to dist/
npm run preview   # preview the production build locally
npm run lint      # run oxlint
```

The app seeds itself on first run with the full A1–C2 roadmap skeleton,
~21 starter flashcards, 12 Pattern Library entries (A1–B2) and ~20 leveled
speaking scenario prompts, so it isn't empty on first launch. All data
lives in IndexedDB (`english-mastery-db`) in your browser — clearing site
data will wipe your progress, so back up anything irreplaceable (there's
currently no export/import; see Roadmap below).

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
- **Patterns as structured, tagged data, not markdown.** Each pattern's
  structure template and example sentences are arrays of `{ text, role }`
  segments (`src/lib/types.ts` — `PatternSegment`), not prose to parse at
  render time. That's what lets the same three colors (subject/verb/object)
  render consistently everywhere a pattern shows up, and lets "Spot the
  Pattern" grade clicks against real target tokens instead of string
  matching.
- **Weekly focus links to patterns via keyword heuristic, not a foreign
  key.** Roadmap modules and Pattern Library entries are independent, editable
  lists; `src/lib/weeklyFocus.ts` matches a module's title against pattern
  categories (e.g. "Conditional" → Conditionals) well enough to surface
  relevant patterns without forcing a rigid 1:1 mapping between the two.

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
    input/         # comprehensible input log
    journal/       # writing journal
    drills/        # sentence production drills
    patterns/      # pattern library, explorer, spot-the-pattern drill
    accent/        # speaking/accent log + scenario prompts
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
