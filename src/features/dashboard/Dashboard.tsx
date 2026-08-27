import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { computeStreak } from '../../lib/streak'
import { expandOccurrences } from '../calendar/occurrences'
import ProgressBar from '../../components/ProgressBar'
import PatternText from '../../components/PatternText'
import IconBadge from '../../components/IconBadge'
import AnimatedNumber from '../../components/motion/AnimatedNumber'
import Confetti from '../../components/motion/Confetti'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { ensureWeeklyFocus, patternsForModule } from '../../lib/weeklyFocus'
import { CATEGORY_COLORS, CEFR_LEVELS, FEATURE_COLORS, type ActivityCategory } from '../../lib/types'
import { BookOpen, Check, Flame, GraduationCap, Layers, Mic, PenLine, Sparkles, Sun, Timer } from 'lucide-react'

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

  const nextLesson = useMemo(() => {
    if (!modules) return null
    for (const level of CEFR_LEVELS) {
      const levelModules = modules.filter((m) => m.level === level).sort((a, b) => a.order - b.order)
      const next = levelModules.find((m) => m.status !== 'done')
      if (next) return next
    }
    return null
  }, [modules])

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div
        variants={fadeUpItem}
        className="blob-decoration flex items-center gap-3 rounded-2xl p-5"
        style={{
          backgroundImage: 'linear-gradient(120deg, var(--accent-soft), var(--blue-soft) 50%, var(--purple-soft))',
          ['--blob-color' as string]: 'var(--purple)',
          ['--blob-color-2' as string]: 'var(--accent)',
        }}
      >
        <div className="blob-content"><IconBadge icon={Sun} color="var(--orange)" size={44} /></div>
        <div className="blob-content">
          <h1 className="text-2xl font-black">Welcome back 👋</h1>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUpItem} className="grid gap-3 sm:grid-cols-3">
        <StatTile
          value={streak}
          label="day streak"
          icon={Flame}
          color="var(--orange)"
          bg="var(--orange-soft)"
        />
        <StatTile
          value={dueFlashcards}
          label="flashcards due"
          icon={Layers}
          color="var(--purple)"
          bg="var(--purple-soft)"
        />
        <StatTile
          value={todaysSessions.length}
          label="sessions today"
          icon={Timer}
          color="var(--blue)"
          bg="var(--blue-soft)"
        />
      </motion.div>

      {nextLesson && (
        <motion.div variants={fadeUpItem}>
          <Link
            to={`/roadmap?lesson=${nextLesson.id}`}
            className="card flex items-center gap-3 p-4 transition-colors hover:border-[var(--accent)]"
            style={{ background: 'var(--accent-soft)', borderColor: 'transparent' }}
          >
            <IconBadge icon={GraduationCap} color="var(--accent)" size={44} />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--accent-dark)' }}>Continue learning</p>
              <p className="font-bold">{nextLesson.level} — {nextLesson.title}</p>
            </div>
            <span className="btn btn-primary px-4 py-2 text-sm">Continue</span>
          </Link>
        </motion.div>
      )}

      <motion.div variants={fadeUpItem} className="flex flex-wrap gap-3">
        <Link to="/timer" className="btn btn-primary px-4 py-2 text-sm">
          <Timer size={16} /> Start Timer
        </Link>
        <Link to="/flashcards" className="btn btn-secondary px-4 py-2 text-sm">
          <Layers size={16} /> Review Flashcards
        </Link>
        <Link to="/accent" className="btn btn-secondary px-4 py-2 text-sm">
          <Mic size={16} /> Log Accent Practice
        </Link>
      </motion.div>

      {weeklyFocusModule && (
        <motion.section
          variants={fadeUpItem}
          className="card space-y-3 p-4"
          style={{ background: 'var(--purple-soft)', borderColor: 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <IconBadge icon={Sparkles} color="var(--purple)" size={32} />
            <h2 className="font-bold">This week's practical focus: {weeklyFocusModule.title}</h2>
          </div>
          {weeklyFocusModule.description && <p className="text-sm text-[var(--text-muted)]">{weeklyFocusModule.description}</p>}
          {focusPatterns.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Related patterns</p>
              {focusPatterns.map((p) => (
                <Link
                  key={p.id}
                  to="/patterns"
                  className="block rounded-xl border-2 border-[var(--border)] p-2 text-sm transition-colors hover:border-[var(--purple)]"
                >
                  <span className="font-bold">{p.name}</span>{' '}
                  <PatternText segments={p.structureTemplate} />
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      )}

      <motion.section variants={fadeUpItem} className="card p-4">
        <h2 className="mb-3 font-bold">Today's practice checklist</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChecklistItem to="/input" icon={BookOpen} label="Comprehensible input" done={inputLoggedToday} feature="input" />
          <ChecklistItem to="/journal" icon={PenLine} label="Writing journal" done={journalDoneToday} feature="journal" />
          <ChecklistItem to="/drills" icon={Sparkles} label="Sentence production drill" done={drillDoneToday} feature="drills" />
          <ChecklistItem
            to="/accent"
            icon={Mic}
            label={todaysScenarioPrompt ? `Speaking prompt: ${todaysScenarioPrompt.prompt}` : 'Speaking practice'}
            done={!todaysScenarioPrompt}
            feature="accent"
          />
        </div>
      </motion.section>

      <motion.section variants={fadeUpItem} className="card p-4">
        <h2 className="mb-3 font-bold">Today's sessions</h2>
        {todaysSessions.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            🌱 Nothing scheduled today — add one on the Calendar to keep your streak going!
          </p>
        )}
        <div className="space-y-2">
          {todaysSessions.map((occ) => (
            <SessionRow
              key={`${occ.session.id}-${occ.date}`}
              title={occ.session.title}
              time={occ.session.startTime}
              color={CATEGORY_COLORS[occ.session.category as ActivityCategory]}
              completed={occ.completed}
              onToggle={() => toggleSessionDone(occ.session.id, occ.date)}
            />
          ))}
        </div>
      </motion.section>

      <motion.section variants={fadeUpItem} className="card max-w-sm p-4">
        <h2 className="mb-2 font-bold">Overall CEFR progress</h2>
        <ProgressBar value={overallProgress} thick gradient />
      </motion.section>
    </motion.div>
  )
}

function StatTile({
  value,
  label,
  icon: Icon,
  color,
  bg,
}: {
  value: number
  label: string
  icon: typeof Flame
  color: string
  bg: string
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center"
      style={{ background: bg, boxShadow: `0 8px 20px -6px ${color}66` }}
    >
      <IconBadge icon={Icon} color={color} size={44} />
      <AnimatedNumber value={value} className="font-display text-3xl font-black" />
      <p className="text-xs font-bold" style={{ color }}>{label}</p>
    </motion.div>
  )
}

function SessionRow({
  title,
  time,
  color,
  completed,
  onToggle,
}: {
  title: string
  time: string
  color: string
  completed: boolean
  onToggle: () => void
}) {
  const [burst, setBurst] = useState(0)

  const handleToggle = () => {
    if (!completed) setBurst((b) => b + 1)
    onToggle()
  }

  return (
    <label className="relative flex items-center gap-3 rounded-xl border-2 border-[var(--border)] px-3 py-2 text-sm">
      <Confetti trigger={burst} />
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: completed ? color : 'var(--border)', background: completed ? color : 'transparent' }}
      >
        <motion.span
          initial={false}
          animate={{ scale: completed ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Check size={14} className="text-white" strokeWidth={3} />
        </motion.span>
      </button>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className={completed ? 'text-[var(--text-muted)] line-through' : ''}>
        {time} — {title}
      </span>
    </label>
  )
}

function ChecklistItem({
  to,
  icon: Icon,
  label,
  done,
  feature,
}: {
  to: string
  icon: typeof Mic
  label: string
  done: boolean
  feature: keyof typeof FEATURE_COLORS
}) {
  const color = FEATURE_COLORS[feature]
  const wasDone = useRef(done)
  const [celebrate, setCelebrate] = useState(0)

  useEffect(() => {
    if (done && !wasDone.current) setCelebrate((c) => c + 1)
    wasDone.current = done
  }, [done])

  return (
    <Link
      to={to}
      className="relative flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm transition-colors"
      style={{ borderColor: done ? 'var(--border)' : color, boxShadow: done ? 'none' : `0 3px 0 ${color}` }}
    >
      <Confetti trigger={celebrate} />
      <IconBadge icon={Icon} color={done ? 'var(--text-muted)' : color} size={30} />
      <span className={done ? 'text-[var(--text-muted)] line-through' : 'font-semibold'}>{label}</span>
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: 'var(--accent)' }}
          >
            <Check size={12} className="text-white" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
