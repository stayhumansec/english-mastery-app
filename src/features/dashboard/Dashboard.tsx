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
import Mascot from '../../components/Mascot'
import AnimatedNumber from '../../components/motion/AnimatedNumber'
import Confetti from '../../components/motion/Confetti'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { ensureWeeklyFocus, patternsForModule } from '../../lib/weeklyFocus'
import { levelProgress } from '../../lib/xpConfig'
import { computeWeakSpots, type WeakSpot } from '../../lib/weakSpots'
import { computeStaleModules, type StaleModule } from '../../lib/staleness'
import { BADGE_DEFINITIONS } from '../../lib/badgeDefinitions'
import { CATEGORY_COLORS, CEFR_LEVELS, FEATURE_COLORS, type ActivityCategory } from '../../lib/types'
import {
  Award,
  BookOpen,
  CalendarDays,
  Check,
  Flame,
  GraduationCap,
  Layers,
  Mic,
  PenLine,
  RefreshCcw,
  Sparkles,
  Sun,
  Timer,
  Zap,
} from 'lucide-react'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

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
  const xpEntries = useLiveQuery(() => db.xpLog.toArray(), [])
  const badgeUnlocks = useLiveQuery(() => db.badgeUnlocks.toArray(), [])

  const [weeklyFocusModuleId, setWeeklyFocusModuleId] = useState<string | null>(null)
  const [weakSpot, setWeakSpot] = useState<WeakSpot | null>(null)
  const [staleModules, setStaleModules] = useState<StaleModule[]>([])

  useEffect(() => {
    ensureWeeklyFocus().then(setWeeklyFocusModuleId)
    computeWeakSpots().then((spots) => setWeakSpot(spots[0] ?? null))
    computeStaleModules().then(setStaleModules)
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

  const level = levelProgress(xpEntries?.reduce((s, e) => s + e.xpAwarded, 0) ?? 0)

  const weeklyXp = useMemo(() => {
    const cutoff = Date.now() - WEEK_MS
    return xpEntries?.filter((e) => e.timestamp >= cutoff).reduce((s, e) => s + e.xpAwarded, 0) ?? 0
  }, [xpEntries])

  const masteredCount = flashcards?.filter((c) => c.repetitions >= 4).length ?? 0

  const recentBadge = useMemo(() => {
    if (!badgeUnlocks) return null
    const unlocked = badgeUnlocks.filter((b) => b.unlockedAt).sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
    if (unlocked.length === 0) return null
    const def = BADGE_DEFINITIONS.find((d) => d.id === unlocked[0].id)
    return def ? { def, unlockedAt: unlocked[0].unlockedAt! } : null
  }, [badgeUnlocks])

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

  // Single "what do I do right now" action: the learning path takes
  // priority, then due flashcards, then today's speaking prompt.
  const primaryAction = nextLesson
    ? { kind: 'lesson' as const, label: 'Continue learning', title: `${nextLesson.level} — ${nextLesson.title}`, to: `/learn?lesson=${nextLesson.id}`, icon: GraduationCap, color: 'var(--accent)' }
    : dueFlashcards > 0
      ? { kind: 'flashcards' as const, label: 'Review due', title: `${dueFlashcards} flashcard${dueFlashcards === 1 ? '' : 's'} due`, to: '/practice?tab=flashcards', icon: Layers, color: 'var(--purple)' }
      : todaysScenarioPrompt
        ? { kind: 'speaking' as const, label: "Today's speaking prompt", title: todaysScenarioPrompt.prompt, to: '/journal-speaking?tab=speaking', icon: Mic, color: 'var(--pink)' }
        : null

  return (
    <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      {/* Primary: the single next action, answerable in 2 seconds */}
      <motion.div
        variants={fadeUpItem}
        className="blob-decoration card p-5"
        style={{
          backgroundImage: 'linear-gradient(120deg, var(--accent-soft), var(--blue-soft) 55%, var(--purple-soft))',
          ['--blob-color' as string]: 'var(--purple)',
          ['--blob-color-2' as string]: 'var(--accent)',
        }}
      >
        <div className="blob-content mb-3 flex items-center gap-2">
          <IconBadge icon={Sun} color="var(--orange)" size={30} />
          <p className="section-header text-sm">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {primaryAction ? (
          <Link to={primaryAction.to} className="blob-content flex items-center gap-4 transition-transform hover:-translate-y-0.5">
            <IconBadge icon={primaryAction.icon} color={primaryAction.color} size={56} />
            <div className="min-w-0 flex-1">
              <p className="meta-label" style={{ color: primaryAction.color }}>{primaryAction.label}</p>
              <p className="page-title truncate">{primaryAction.title}</p>
            </div>
            <span className="btn btn-primary shrink-0 px-5 py-2.5 text-sm">Continue</span>
          </Link>
        ) : (
          <div className="blob-content flex items-center gap-4">
            <Mascot pose="celebrate" size={56} />
            <div>
              <p className="page-title">All caught up!</p>
              <p className="body-text text-[var(--text-muted)]">Nothing urgent right now — great work.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Secondary: compact standing row, not competing with the action above */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-3 gap-2">
        <CompactStat value={streak} label="day streak" icon={Flame} color="var(--orange)" />
        <CompactStat value={level.level} label={`level · ${level.xpIntoLevel}/${level.xpForNextLevel} XP`} icon={Zap} color="var(--yellow)" isLevel />
        <CompactStat value={todaysSessions.length} label="sessions today" icon={Timer} color="var(--blue)" />
      </motion.div>

      {/* Tertiary: more detail, checklist, nudges, sessions, progress */}
      {weakSpot?.pattern && (
        <motion.div variants={fadeUpItem} className="card flex items-center gap-3 p-3" style={{ background: 'var(--purple-soft)' }}>
          <IconBadge icon={Sparkles} color="var(--purple)" size={32} />
          <div className="min-w-0 flex-1">
            <p className="meta-label" style={{ color: 'var(--purple)' }}>Weak spot</p>
            <p className="body-text text-sm">{weakSpot.pattern.name} — {weakSpot.score} attempts to revisit</p>
          </div>
          <Link to={`/practice?tab=drills&patternId=${weakSpot.patternId}`} className="btn btn-secondary shrink-0 px-3 py-1.5 text-xs">
            Try again
          </Link>
        </motion.div>
      )}

      {staleModules.length > 0 && (
        <motion.div variants={fadeUpItem} className="card flex items-center gap-3 p-3" style={{ background: 'var(--teal-soft)' }}>
          <IconBadge icon={RefreshCcw} color="var(--teal)" size={32} />
          <div className="min-w-0 flex-1">
            <p className="meta-label" style={{ color: 'var(--teal)' }}>Time to refresh</p>
            <p className="body-text text-sm">
              "{staleModules[0].module.title}" — last practiced {staleModules[0].daysSincePracticed} days ago
            </p>
          </div>
          <Link to={`/learn?refresh=${staleModules[0].module.id}`} className="btn btn-secondary shrink-0 px-3 py-1.5 text-xs">
            Refresh
          </Link>
        </motion.div>
      )}

      {weeklyFocusModule && (
        <motion.section
          variants={fadeUpItem}
          className="card space-y-3 p-4"
          style={{ background: 'var(--purple-soft)', borderColor: 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <IconBadge icon={Sparkles} color="var(--purple)" size={32} />
            <h2 className="section-header text-sm">This week's practical focus: {weeklyFocusModule.title}</h2>
          </div>
          {weeklyFocusModule.description && <p className="body-text text-sm text-[var(--text-muted)]">{weeklyFocusModule.description}</p>}
          {focusPatterns.length > 0 && (
            <div className="space-y-2">
              <p className="meta-label">Related patterns</p>
              {focusPatterns.map((p) => (
                <Link
                  key={p.id}
                  to="/practice?tab=patterns"
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

      <motion.div variants={fadeUpItem} className="flow-connector" style={{ ['--connector-color' as string]: 'var(--accent)' }} />

      <motion.section variants={fadeUpItem} className="card p-4">
        <h2 className="section-header mb-3 text-sm">Today's practice checklist</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChecklistItem to="/journal-speaking?tab=input" icon={BookOpen} label="Comprehensible input" done={inputLoggedToday} feature="input" />
          <ChecklistItem to="/journal-speaking?tab=journal" icon={PenLine} label="Writing journal" done={journalDoneToday} feature="journal" />
          <ChecklistItem to="/practice?tab=drills" icon={Sparkles} label="Sentence production drill" done={drillDoneToday} feature="drills" />
          <ChecklistItem
            to="/journal-speaking?tab=speaking"
            icon={Mic}
            label={todaysScenarioPrompt ? `Speaking prompt: ${todaysScenarioPrompt.prompt}` : 'Speaking practice'}
            done={!todaysScenarioPrompt}
            feature="accent"
          />
        </div>
      </motion.section>

      <motion.div variants={fadeUpItem} className="flow-connector" style={{ ['--connector-color' as string]: 'var(--blue)' }} />

      <motion.section variants={fadeUpItem} className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-header text-sm">Today's sessions</h2>
          <Link to="/calendar" className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--blue)' }}>
            <CalendarDays size={14} /> View calendar
          </Link>
        </div>
        {todaysSessions.length === 0 && (
          <p className="body-text text-sm text-[var(--text-muted)]">
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

      {/* A row of evenly-sized summary cards instead of one progress card
         sitting alone next to empty space — a soft ambient glow fills the
         area behind them. */}
      <motion.div
        variants={fadeUpItem}
        className="glow-section rounded-3xl p-1"
        style={{ ['--glow-color' as string]: 'var(--accent)', ['--glow-color-2' as string]: 'var(--blue)' }}
      >
        <div className="glow-content grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4">
            <p className="meta-label mb-2">Overall CEFR progress</p>
            <p className="mb-2 text-2xl font-black">{Math.round(overallProgress)}%</p>
            <ProgressBar value={overallProgress} thick gradient />
          </div>
          <SummaryCard icon={Zap} color="var(--yellow)" label="XP this week" value={weeklyXp} />
          <SummaryCard icon={Layers} color="var(--purple)" label="Flashcards mastered" value={masteredCount} />
          {recentBadge ? (
            <div className="card flex flex-col justify-center gap-2 p-4">
              <p className="meta-label">Recent achievement</p>
              <div className="flex items-center gap-2">
                <IconBadge icon={recentBadge.def.icon} color="var(--yellow)" size={34} />
                <div className="min-w-0">
                  <p className="section-header truncate text-sm">{recentBadge.def.name}</p>
                  <p className="meta-label">{new Date(recentBadge.unlockedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col justify-center gap-1 p-4">
              <IconBadge icon={Award} color="var(--text-muted)" size={34} />
              <p className="meta-label">No badges yet</p>
              <p className="body-text text-xs text-[var(--text-muted)]">Keep practicing to unlock your first one.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function SummaryCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof Zap
  color: string
  label: string
  value: number
}) {
  return (
    <div className="card flex flex-col justify-center gap-1 p-4">
      <IconBadge icon={Icon} color={color} size={34} />
      <AnimatedNumber value={value} className="font-display text-2xl font-black" />
      <p className="meta-label">{label}</p>
    </div>
  )
}

function CompactStat({
  value,
  label,
  icon: Icon,
  color,
  isLevel = false,
}: {
  value: number
  label: string
  icon: typeof Flame
  color: string
  isLevel?: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl p-2.5" style={{ background: `${color}14` }}>
      <IconBadge icon={Icon} color={color} size={30} />
      <div className="min-w-0">
        <AnimatedNumber value={value} className="font-display text-lg font-black" />
        <p className="meta-label truncate" style={{ color }}>{isLevel ? label : label}</p>
      </div>
    </div>
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
      className="relative flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:brightness-[1.03]"
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
