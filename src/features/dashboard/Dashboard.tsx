import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { computeStreak } from '../../lib/streak'
import { expandOccurrences } from '../calendar/occurrences'
import ProgressBar from '../../components/ProgressBar'
import PatternText from '../../components/PatternText'
import { ensureWeeklyFocus, patternsForModule } from '../../lib/weeklyFocus'
import { CATEGORY_COLORS, type ActivityCategory } from '../../lib/types'
import { BookOpen, Layers, Mic, PenLine, Sparkles, Timer } from 'lucide-react'

export default function Dashboard() {
  const modules = useLiveQuery(() => db.modules.toArray(), [])
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const flashcards = useLiveQuery(() => db.flashcards.toArray(), [])
  const timerLogs = useLiveQuery(() => db.timerLogs.toArray(), [])
  const accentLogs = useLiveQuery(() => db.accentLogs.toArray(), [])
  const inputLogs = useLiveQuery(() => db.inputLogs.toArray(), [])
  const journalEntries = useLiveQuery(() => db.journalEntries.toArray(), [])
  const drillAttempts = useLiveQuery(() => db.drillAttempts.toArray(), [])
  const patterns = useLiveQuery(() => db.patterns.toArray(), [])
  const scenarioPrompts = useLiveQuery(() => db.scenarioPrompts.toArray(), [])

  const [weeklyFocusModuleId, setWeeklyFocusModuleId] = useState<string | null>(null)

  useEffect(() => {
    ensureWeeklyFocus().then(setWeeklyFocusModuleId)
  }, [])

  const today = todayIso()

  const todaysSessions = useMemo(() => {
    if (!sessions) return []
    return sessions
      .flatMap((s) => expandOccurrences(s, today, today))
      .sort((a, b) => a.session.startTime.localeCompare(b.session.startTime))
  }, [sessions, today])

  const dueFlashcards = flashcards?.filter((c) => c.dueDate <= today).length ?? 0

  const streak = useMemo(() => {
    const dates = new Set<string>()
    timerLogs?.forEach((l) => dates.add(l.date))
    accentLogs?.forEach((l) => dates.add(l.date))
    sessions?.forEach((s) => s.completedDates.forEach((d) => dates.add(d)))
    return computeStreak(dates)
  }, [timerLogs, accentLogs, sessions])

  const overallProgress = useMemo(() => {
    if (!modules || modules.length === 0) return 0
    const done = modules.filter((m) => m.status === 'done').length
    const inProgress = modules.filter((m) => m.status === 'in_progress').length
    return ((done + inProgress * 0.5) / modules.length) * 100
  }, [modules])

  const toggleSessionDone = async (sessionId: string, date: string) => {
    const session = sessions?.find((s) => s.id === sessionId)
    if (!session) return
    const completed = session.completedDates.includes(date)
    const completedDates = completed
      ? session.completedDates.filter((d) => d !== date)
      : [...session.completedDates, date]
    await db.sessions.update(sessionId, { completedDates })
  }

  const inputLoggedToday = inputLogs?.some((e) => e.date === today) ?? false
  const journalDoneToday = journalEntries?.some((e) => e.date === today) ?? false
  const drillDoneToday = drillAttempts?.some((a) => a.date === today) ?? false

  const todaysScenarioPrompt = useMemo(() => {
    if (!scenarioPrompts || scenarioPrompts.length === 0) return null
    const alreadyDone = accentLogs?.some((l) => l.date === today && l.scenarioPromptId)
    if (alreadyDone) return null
    // Deterministic "prompt of the day" so it doesn't change on every render.
    const dayIndex = Number(today.replaceAll('-', '')) % scenarioPrompts.length
    return scenarioPrompts[dayIndex]
  }, [scenarioPrompts, accentLogs, today])

  const weeklyFocusModule = modules?.find((m) => m.id === weeklyFocusModuleId)
  const focusPatterns = weeklyFocusModule && patterns ? patternsForModule(weeklyFocusModule, patterns) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-[var(--text-muted)]">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4 text-center">
          <p className="text-3xl font-semibold text-[var(--accent)]">{streak}</p>
          <p className="text-xs text-[var(--text-muted)]">day streak</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-semibold text-[var(--accent)]">{dueFlashcards}</p>
          <p className="text-xs text-[var(--text-muted)]">flashcards due</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-semibold text-[var(--accent)]">{todaysSessions.length}</p>
          <p className="text-xs text-[var(--text-muted)]">sessions today</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/timer" className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
          <Timer size={16} /> Start Timer
        </Link>
        <Link to="/flashcards" className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium">
          <Layers size={16} /> Review Flashcards
        </Link>
        <Link to="/accent" className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium">
          <Mic size={16} /> Log Accent Practice
        </Link>
      </div>

      {weeklyFocusModule && (
        <section className="card space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent)]" />
            <h2 className="font-medium">This week's practical focus: {weeklyFocusModule.title}</h2>
          </div>
          {weeklyFocusModule.description && <p className="text-sm text-[var(--text-muted)]">{weeklyFocusModule.description}</p>}
          {focusPatterns.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Related patterns</p>
              {focusPatterns.map((p) => (
                <Link key={p.id} to="/patterns" className="block rounded-lg border border-[var(--border)] p-2 text-sm hover:border-[var(--accent)]">
                  <span className="font-medium">{p.name}</span>{' '}
                  <PatternText segments={p.structureTemplate} />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="card p-4">
        <h2 className="mb-3 font-medium">Today's practice checklist</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChecklistItem to="/input" icon={BookOpen} label="Comprehensible input" done={inputLoggedToday} />
          <ChecklistItem to="/journal" icon={PenLine} label="Writing journal" done={journalDoneToday} />
          <ChecklistItem to="/drills" icon={Sparkles} label="Sentence production drill" done={drillDoneToday} />
          <ChecklistItem
            to="/accent"
            icon={Mic}
            label={todaysScenarioPrompt ? `Speaking prompt: ${todaysScenarioPrompt.prompt}` : 'Speaking practice'}
            done={!todaysScenarioPrompt}
          />
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 font-medium">Today's sessions</h2>
        {todaysSessions.length === 0 && <p className="text-sm text-[var(--text-muted)]">Nothing scheduled today.</p>}
        <div className="space-y-2">
          {todaysSessions.map((occ) => (
            <label key={`${occ.session.id}-${occ.date}`} className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={occ.completed}
                onChange={() => toggleSessionDone(occ.session.id, occ.date)}
              />
              <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[occ.session.category as ActivityCategory] }} />
              <span className={occ.completed ? 'line-through text-[var(--text-muted)]' : ''}>
                {occ.session.startTime} — {occ.session.title}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="card max-w-sm p-4">
        <h2 className="mb-2 font-medium">Overall CEFR progress</h2>
        <ProgressBar value={overallProgress} />
      </section>
    </div>
  )
}

function ChecklistItem({
  to,
  icon: Icon,
  label,
  done,
}: {
  to: string
  icon: typeof Mic
  label: string
  done: boolean
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        done ? 'border-[var(--border)] text-[var(--text-muted)]' : 'border-[var(--accent)] text-[var(--text)]'
      }`}
    >
      <Icon size={16} className={done ? 'text-[var(--text-muted)]' : 'text-[var(--accent)]'} />
      <span className={done ? 'line-through' : ''}>{label}</span>
      {done && <span className="ml-auto text-xs">done</span>}
    </Link>
  )
}
