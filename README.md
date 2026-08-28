# English Mastery

A web app for taking yourself from A1 (beginner) to C2 (near-native)
English, with a focus on practical usage and accent training. It's
local-first — everything is stored in your browser via IndexedDB — with
an optional Google account layer on top: sign in and your progress is
also saved to your account so it follows you to another browser or
device. Without Firebase configured (see below), the app runs exactly as
a local-only PWA with no login required.

## Accounts & Cloud Sync

When Firebase is configured (see **Setting up Google Sign-In** below),
signing in with Google unlocks:

- Your own private account — every signed-in user's data is isolated by
  Firestore security rules (`firestore.rules`); nobody else can read or
  write it.
- **Snapshot-based sync**, not live real-time sync: the whole local
  database is saved as one document (the same shape as Settings' JSON
  export/import) to `users/{uid}/backup/current` periodically, when the
  tab is hidden, on sign-out, and via a manual "Sync now" button in
  Settings → Cloud Account. Signing in on a new device pulls down and
  restores the most recent snapshot. If you edit offline on two devices
  at once before either syncs, the last save wins — there's no field-level
  merge.
- A profile chip in the sidebar (photo/name + sign-out) and a Cloud
  Account section in Settings (sync status + manual sync + sign-out).

Without Firebase env vars set, none of this activates — no login gate,
no sidebar chip, no Settings section — and the app behaves exactly like
the original local-only build.

### Setting up Google Sign-In

1. Go to [console.firebase.google.com](https://console.firebase.google.com),
   sign in, and **Add project**.
2. **Build → Authentication → Get started** → enable the **Google**
   provider.
3. **Build → Firestore Database → Create database** → start in
   **production mode**.
4. In **Firestore Database → Rules**, paste the contents of
   `firestore.rules` from this repo and **Publish** — this is what
   actually enforces that each user can only access their own data.
5. **Project settings → General → Your apps → Add app → Web (`</>`)** →
   register it → copy the `firebaseConfig` values shown.
6. For local development: `cp .env.example .env` and fill in the six
   `VITE_FIREBASE_*` values from step 5.
7. For the deployed site: add the same six values as repository secrets
   (GitHub repo → **Settings → Secrets and variables → Actions → New
   repository secret**) using the exact names from `.env.example` — the
   `deploy-pages.yml` workflow reads them from there at build time.

These config values are Firebase's public client identifiers, not
secrets — they're safe to have in a public repo's build; the actual
access control lives in `firestore.rules`.

## Navigation

Six primary destinations: **Home** (a single "what do I do right now"
action, then a compact stats row, then checklist/nudges/progress),
**Learn** (the CEFR roadmap + lessons), **Practice** (Flashcards, Drills,
Patterns and the Study Timer as tabs in one hub), **Journal** (Journal,
Speaking and the Comprehensible Input Log as tabs), **Progress**
(Achievements + Weekly Recap), and **Settings**. Calendar stays fully
functional but is reached via a link from Home rather than a top-level nav
slot. A short skippable onboarding flow (welcome → starting level → roadmap
preview → land on Home) shows once, on first launch.

## Features

- **CEFR Roadmap** — an editable A1→C2 curriculum tracker. Modules with
  written lesson content (all of A1 so far) open into a full guided lesson
  using **guided discovery** (British Council method): examples come first
  under "notice the pattern," then a guided question, with the rule itself
  gated behind a "Reveal the rule" button rather than stated upfront. Each
  lesson also has a plain-language rule explanation, a "watch out for this"
  mistakes list, in-context practice (linked flashcards, a Sentence
  Production Drill, an embedded Spot the Pattern warm-up), and a mini-quiz —
  a lesson-backed module can only be marked done after passing its quiz
  (70%+). Lessons carry a self-labeled Easy/Medium/Hard difficulty tag
  (independent of CEFR level, BBC-style) alongside the level badge. Modules
  within a level are lightly sequenced, with a "recommended after X"
  indicator. Modules without lesson content yet fall back to a "coming soon"
  shell with the original manual status dropdown. Per-level and overall
  progress bars throughout.
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
  Tracks weekly input minutes and a separate weekly streak. Includes a
  **Starter Reading Library** (LingQ-style): 10 pre-written mini-stories
  across A1–B1 built around one recurring character, deliberately reusing
  a small, overlapping set of core vocabulary across passages. Unfamiliar
  words are click-to-reveal (meaning + one-click add-to-flashcards), and a
  "x/y words looked up" counter per story makes repeated exposure visible.
- **Writing Journal** — a daily free-write with word count and streak
  tracking, optionally tagged with the grammar pattern or vocabulary you
  deliberately tried to use. Output practice, not grammar recognition.
- **Speaking & Accent Log** — a leveled scenario-prompt generator
  (everyday/professional/storytelling/debate) with a simple practice timer
  (no audio recorded), self-rating, notes, category coverage so gaps in
  speaking practice are visible, and a minimal-pairs reference (ship/sheep,
  think/sink...) to self-monitor against while shadowing — the same sound
  distinctions ELSA-style apps score automatically, just self-assessed.
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
- **Gamification** — XP for real logged actions (flashcard reviews, drills,
  journal entries, speaking prompts, input log entries, completed modules
  and levels, a daily login bonus), a level (`floor(sqrt(totalXP / 100))`)
  shown with an animated progress bar, and 17 pre-seeded badges (streak,
  vocabulary, roadmap, output, consistency) unlocked by a single
  progress-check function per badge run after any logged action — unlocks
  get the full celebration treatment (confetti, mascot, toast). A **Weekly
  Recap** (Progress → This Week) computes study minutes, reviews, new
  words, journal words, streak status, XP and a dynamically-picked
  highlight from the last 7 days of logged data, live on every render.
- **Mistake pattern tracker** — after a Sentence Production Drill's model
  answer, a 3-question self-check rubric (grammar/naturalness/register)
  feeds a rolling 30-day weak-spot score per pattern; patterns with 2+
  qualifying attempts surface in Practice → Patterns with "Review pattern"
  and "Try again" actions, and the single worst weak spot appears as a
  gentle nudge on Home.
- **Vocabulary depth** — flashcards carry an optional COCA-style frequency
  tier (Top 1000/3000/5000/Beyond) and a `collocations` list shown as chips
  on the card back; the deck browser filters by tier, and a "prioritize
  high-frequency words" toggle sorts the daily study queue toward them.
- **Retention safety net** — a "done" module whose linked pattern hasn't
  had a flashcard review or drill attempt in 21+ days is flagged as
  needing a refresh (a calmer, teal "Time to Refresh" card on Home, an
  indicator in Learn); the refresh flow shows the pattern plus 2-3
  flashcards out of cycle and resets the staleness timer.
- **Backup & Restore** (Settings) — exports every local table to one
  `english-mastery-backup-YYYY-MM-DD.json` file (with a `schemaVersion`)
  and restores from one with a confirmation modal and validation; Settings
  shows the last backup date and a reminder banner past 14 days.
- **Personal relevance notes** — a handful of roadmap modules and pattern
  entries with a genuine professional/cybersecurity-adjacent connection
  (register, passive voice for incident reports, reported speech,
  persuasion) carry a short "Useful for:" aside on their lesson/detail
  page; left blank everywhere a connection would be forced.
- Installable **PWA** that works offline.
- A light, colorful, Duolingo-style design system — a consistent
  typographic scale (page title / section header / body / uppercase
  meta label), a recurring blob-style mascot character (empty states,
  celebrations, onboarding), bright per-feature/per-level colors, rounded
  cards and pill buttons, and springy Framer Motion animation concentrated
  into a handful of "signature moments" (lesson complete, level-up,
  streak milestones via badges, finishing a practice session) — everything
  else (hovers, tab switches, page transitions) stays quick and
  understated, with a `prefers-reduced-motion` fallback throughout.

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [Framer Motion](https://motion.dev) for animation (page transitions,
  count-up numbers, spring-animated progress bars, the flashcard flip,
  confetti, toasts, modals — see `src/components/motion/`)
- [Dexie.js](https://dexie.org) over IndexedDB for storage
- [Firebase](https://firebase.google.com) (Auth + Firestore) for optional
  Google Sign-In and cloud account sync — see Accounts & Cloud Sync above
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
data will wipe your progress, so back up anything irreplaceable via
Settings → Backup & Restore → Export my data.

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
  lib/              # storage (Dexie schema), types, SM-2, date/streak utils,
                     # XP/badges/weak-spots/staleness/backup, notifications
  routes/           # top-level layout + nav
  components/       # small shared UI (progress bars, mascot, etc.)
  features/
    dashboard/      # Home
    roadmap/        # Learn — CEFR roadmap tracker + lessons
    practice/       # Practice hub (tabs: flashcards/drills/patterns/timer)
    journalSpeaking/# Journal hub (tabs: journal/speaking/input log)
    progress/       # Progress hub (achievements + weekly recap)
    onboarding/      # first-launch welcome flow
    calendar/       # calendar + recurrence expansion (linked from Home)
    timer/          # study timer + session history (a Practice tab)
    flashcards/     # decks, study session, card CRUD (a Practice tab)
    input/          # comprehensible input log (a Journal tab)
    journal/        # writing journal (a Journal tab)
    drills/         # sentence production drills (a Practice tab)
    patterns/       # pattern library, spot-the-pattern drill (a Practice tab)
    accent/         # speaking/accent log + scenario prompts (a Journal tab)
    settings/       # reminders, weekly recap toggle, backup & restore
```

Each feature folder is self-contained (its own page component(s)); shared
logic lives in `lib/`. The five hub-style destinations (Practice, Journal,
Progress, plus Home/Learn) embed the underlying feature pages as tabs
rather than owning their own routes, so this is meant to make it easy to
keep extending — e.g. a new feature is a new folder embedded as a tab (or a
new route in `App.tsx` for something that doesn't fit a hub).

## Roadmap (possible future work)

- Optional cloud sync (v2)
- Push-based reminders via a real backend, if background reliability matters
  enough to justify one
