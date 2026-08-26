import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { computeStreak } from '../../lib/streak'
import { expandOccurrences } from '../calendar/occurrences'
import ProgressBar from '../../components/ProgressBar'
import { CATEGORY_COLORS, type ActivityCategory } from '../../lib/types'
import { Layers, Mic, Timer } from 'lucide-react'

export default function Dashboard() {
  const modules = useLiveQuery(() => db.modules.toArray(), [])
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const flashcards = useLiveQuery(() => db.flashcards.toArray(), [])
  const timerLogs = useLiveQuery(() => db.timerLogs.toArray(), [])
  const accentLogs = useLiveQuery(() => db.accentLogs.toArray(), [])

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
