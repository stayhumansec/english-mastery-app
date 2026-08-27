import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import ProgressBar from '../../components/ProgressBar'
import PatternText from '../../components/PatternText'
import Confetti from '../../components/motion/Confetti'
import Quiz from '../../components/Quiz'
import SpotThePattern from '../../components/SpotThePattern'
import Mascot from '../../components/Mascot'
import { useToast } from '../../components/motion/ToastProvider'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { LESSON_CONTENT, QUIZ_PASS_THRESHOLD } from '../../lib/lessonContent'
import { patternsForModule } from '../../lib/weeklyFocus'
import { markModuleRefreshed } from '../../lib/staleness'
import { awardXp, totalXp } from '../../lib/xp'
import { levelForXp } from '../../lib/xpConfig'
import { evaluateBadges } from '../../lib/badges'
import {
  CEFR_LEVELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  LEVEL_COLORS,
  type CefrLevel,
  type LessonDifficulty,
  type ModuleStatus,
  type Pattern,
  type RoadmapModule,
} from '../../lib/types'
import {
  AlertTriangle,
  Briefcase,
  Check,
  Coffee,
  Feather,
  GraduationCap,
  Lightbulb,
  Lock,
  Map,
  Plus,
  Settings2,
  Star,
  Trash2,
} from 'lucide-react'
import IconBadge from '../../components/IconBadge'
import type { ExampleContext } from '../../lib/types'

const CONTEXT_ICON: Record<ExampleContext, typeof Coffee> = {
  everyday: Coffee,
  professional: Briefcase,
  storytelling: Feather,
}

const STATUS_LABEL: Record<ModuleStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
}

function levelProgress(modules: RoadmapModule[]): number {
  if (modules.length === 0) return 0
  const done = modules.filter((m) => m.status === 'done').length
  const inProgress = modules.filter((m) => m.status === 'in_progress').length
  return ((done + inProgress * 0.5) / modules.length) * 100
}

export default function Roadmap() {
  const modules = useLiveQuery(() => db.modules.orderBy('order').toArray(), [])
  const patterns = useLiveQuery(() => db.patterns.toArray(), [])
  const [addingFor, setAddingFor] = useState<CefrLevel | null>(null)
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const lessonModuleId = searchParams.get('lesson')
  const refreshModuleId = searchParams.get('refresh')

  // The current/next actionable module, auto-scrolled into view on load so
  // the path opens where the learner left off rather than at the top.
  const nextModuleId = useMemo(() => {
    if (!modules) return null
    for (const level of CEFR_LEVELS) {
      const levelModules = modules.filter((m) => m.level === level).sort((a, b) => a.order - b.order)
      const next = levelModules.find((m) => m.status !== 'done')
      if (next) return next.id
    }
    return null
  }, [modules])

  useEffect(() => {
    if (!nextModuleId) return
    const t = window.setTimeout(() => {
      document.getElementById(`roadmap-node-${nextModuleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 350)
    return () => window.clearTimeout(t)
  }, [nextModuleId])

  if (!modules) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  const overall = levelProgress(modules)

  const updateModule = async (id: string, patch: Partial<RoadmapModule>) => {
    await db.modules.update(id, patch)
    if (patch.status === 'done') showToast('Module complete — nice work!', '🎉')
  }

  const openLesson = (id: string) => setSearchParams({ lesson: id })
  const closeLesson = () => setSearchParams({})

  const refreshModule = refreshModuleId ? modules.find((m) => m.id === refreshModuleId) : null
  if (refreshModule) {
    return <RefreshView module={refreshModule} patterns={patterns ?? []} onDone={closeLesson} />
  }

  const lessonModule = lessonModuleId ? modules.find((m) => m.id === lessonModuleId) : null
  if (lessonModule) {
    const levelModules = modules.filter((m) => m.level === lessonModule.level).sort((a, b) => a.order - b.order)
    const idx = levelModules.findIndex((m) => m.id === lessonModule.id)
    const prevModule = idx > 0 ? levelModules[idx - 1] : null
    return (
      <LessonView
        key={lessonModule.id}
        module={lessonModule}
        prevModule={prevModule}
        patterns={patterns ?? []}
        onBack={closeLesson}
        onUpdate={(patch) => updateModule(lessonModule.id, patch)}
      />
    )
  }

  const addModule = async (level: CefrLevel, title: string) => {
    if (!title.trim()) return
    const maxOrder = modules.reduce((m, mod) => Math.max(m, mod.order), 0)
    await db.modules.add({
      id: uuid(),
      level,
      title: title.trim(),
      description: '',
      status: 'not_started',
      notes: '',
      order: maxOrder + 1,
      createdAt: Date.now(),
    })
    setAddingFor(null)
  }

  const deleteModule = async (id: string) => {
    await db.modules.delete(id)
  }

  const moveModule = async (mod: RoadmapModule, direction: -1 | 1) => {
    const siblings = modules
      .filter((m) => m.level === mod.level)
      .sort((a, b) => a.order - b.order)
    const idx = siblings.findIndex((m) => m.id === mod.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= siblings.length) return
    const other = siblings[swapIdx]
    await db.modules.update(mod.id, { order: other.order })
    await db.modules.update(other.id, { order: mod.order })
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div
        variants={fadeUpItem}
        className="blob-decoration card flex items-center gap-3 p-4"
        style={{ ['--blob-color' as string]: 'var(--accent)', ['--blob-color-2' as string]: 'var(--purple)' }}
      >
        <div className="blob-content"><IconBadge icon={Map} color="var(--accent)" size={44} /></div>
        <div className="blob-content flex-1">
          <h1 className="page-title">CEFR Roadmap</h1>
          <p className="body-text text-[var(--text-muted)]">
            A guided course, A1 → C2 — work through each level in order.
          </p>
          <div className="mt-3 max-w-sm">
            <ProgressBar value={overall} label="Overall progress" color="var(--accent)" thick />
          </div>
        </div>
      </motion.div>

      {CEFR_LEVELS.map((level) => {
        const levelModules = modules
          .filter((m) => m.level === level)
          .sort((a, b) => a.order - b.order)
        const color = LEVEL_COLORS[level]
        const pct = levelProgress(levelModules)
        return (
          <motion.section
            key={level}
            variants={fadeUpItem}
            className="rounded-3xl p-4 md:p-6"
            style={{ background: `color-mix(in srgb, ${color} 6%, var(--surface))` }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ background: color }}
                >
                  {level}
                </span>
                <h2 className="section-header">Level {level}</h2>
              </div>
              <button
                onClick={() => setAddingFor(level)}
                className="flex items-center gap-1 text-xs font-bold hover:underline"
                style={{ color }}
              >
                <Plus size={14} /> Add module
              </button>
            </div>

            {addingFor === level && (
              <div className="mb-4">
                <AddModuleForm
                  onCancel={() => setAddingFor(null)}
                  onSubmit={(title) => addModule(level, title)}
                  color={color}
                />
              </div>
            )}

            {levelModules.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No modules yet — add your first one above!</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
                <LevelPath
                  levelModules={levelModules}
                  color={color}
                  onOpen={openLesson}
                  onUpdate={updateModule}
                  onDelete={deleteModule}
                  onMove={moveModule}
                />
                <aside className="hidden lg:block">
                  <div className="sticky top-4 card space-y-3 p-4">
                    <p className="meta-label" style={{ color }}>This level</p>
                    <p className="text-2xl font-black">{Math.round(pct)}%</p>
                    <ProgressBar value={pct} color={color} thick />
                    <p className="body-text text-sm text-[var(--text-muted)]">
                      {levelModules.length} module{levelModules.length === 1 ? '' : 's'} · {levelModules.filter((m) => m.status === 'done').length} done
                    </p>
                    <p className="body-text text-sm text-[var(--text-muted)]">{levelBlurb(pct)}</p>
                  </div>
                </aside>
              </div>
            )}
          </motion.section>
        )
      })}
    </motion.div>
  )
}

function levelBlurb(pct: number): string {
  if (pct >= 100) return 'Level complete — nice work! 🎉'
  if (pct >= 50) return "You're over halfway through this level."
  if (pct > 0) return 'Good start — keep the momentum going.'
  return 'Ready when you are — tap a node below to begin.'
}

/** Duolingo-style winding path: nodes alternate left/right down a smooth
 * connecting line instead of a stacked list of full-width rows. Clicking a
 * node opens the lesson exactly as before; a small gear toggles the same
 * reorder/notes/delete controls the old row had, shown as a detail card
 * beneath the path so no functionality is lost. */
function LevelPath({
  levelModules,
  color,
  onOpen,
  onUpdate,
  onDelete,
  onMove,
}: {
  levelModules: RoadmapModule[]
  color: string
  onOpen: (id: string) => void
  onUpdate: (id: string, patch: Partial<RoadmapModule>) => void
  onDelete: (id: string) => void
  onMove: (mod: RoadmapModule, dir: -1 | 1) => void
}) {
  const [tipId, setTipId] = useState<string | null>(null)
  const [managingId, setManagingId] = useState<string | null>(null)

  const rowHeight = 122
  const nodeSize = 60
  const xLeft = 24
  const xRight = 76
  const height = levelModules.length * rowHeight + 20

  const points = levelModules.map((_, i) => ({
    x: i % 2 === 0 ? xLeft : xRight,
    y: i * rowHeight + rowHeight / 2 + 10,
  }))

  let pathD = ''
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const midY = (prev.y + curr.y) / 2
      pathD += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
    }
  }

  const managingMod = managingId ? levelModules.find((m) => m.id === managingId) : null
  const managingIdx = managingMod ? levelModules.findIndex((m) => m.id === managingMod.id) : -1

  return (
    <div>
      <div className="relative mx-auto w-full max-w-md" style={{ height }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 8" opacity={0.4} />
        </svg>

        {levelModules.map((mod, i) => {
          const prevDone = i === 0 || levelModules[i - 1].status === 'done'
          const locked = !prevDone
          const point = points[i]
          const alignRight = point.x > 50
          return (
            <div
              key={mod.id}
              id={`roadmap-node-${mod.id}`}
              className="absolute flex flex-col items-center"
              style={{
                left: `${point.x}%`,
                top: point.y,
                transform: 'translate(-50%, -50%)',
                width: 150,
              }}
            >
              <PathNode
                mod={mod}
                color={color}
                locked={locked}
                size={nodeSize}
                onOpen={() => (locked ? setTipId((t) => (t === mod.id ? null : mod.id)) : onOpen(mod.id))}
              />
              <div className={`mt-1.5 flex flex-col items-center gap-0.5 text-center ${alignRight ? '' : ''}`}>
                <span className={`text-xs font-bold leading-tight ${mod.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''}`}>
                  {mod.title}
                </span>
                {!!LESSON_CONTENT[mod.title]?.difficulty && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                    style={{ background: DIFFICULTY_COLORS[LESSON_CONTENT[mod.title].difficulty] }}
                  >
                    {DIFFICULTY_LABELS[LESSON_CONTENT[mod.title].difficulty]}
                  </span>
                )}
                <button
                  onClick={() => setManagingId((m) => (m === mod.id ? null : mod.id))}
                  className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  <Settings2 size={11} /> Manage
                </button>
                {tipId === mod.id && locked && i > 0 && (
                  <span className="mt-1 max-w-[150px] rounded-lg bg-[var(--text)] px-2 py-1 text-[10px] font-semibold text-white">
                    Recommended after "{levelModules[i - 1].title}"
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {managingMod && (
        <div className="mt-4">
          <p className="meta-label mb-1" style={{ color }}>Managing</p>
          <ModuleRow
            mod={managingMod}
            color={color}
            locked={managingIdx > 0 && levelModules[managingIdx - 1].status !== 'done'}
            recommendedAfter={managingIdx > 0 ? levelModules[managingIdx - 1].title : undefined}
            hasLesson={!!LESSON_CONTENT[managingMod.title]}
            difficulty={LESSON_CONTENT[managingMod.title]?.difficulty}
            onOpen={() => onOpen(managingMod.id)}
            onUpdate={(patch) => onUpdate(managingMod.id, patch)}
            onDelete={() => {
              onDelete(managingMod.id)
              setManagingId(null)
            }}
            onMove={(dir) => onMove(managingMod, dir)}
          />
        </div>
      )}
    </div>
  )
}

function PathNode({
  mod,
  color,
  locked,
  size,
  onOpen,
}: {
  mod: RoadmapModule
  color: string
  locked: boolean
  size: number
  onOpen: () => void
}) {
  const done = mod.status === 'done'
  const inProgress = mod.status === 'in_progress'

  const style: CSSProperties = { width: size, height: size }
  if (locked) {
    style.background = 'var(--surface-alt)'
    style.border = '3px solid var(--border)'
  } else if (done) {
    style.background = color
    style.boxShadow = `0 0 0 4px color-mix(in srgb, ${color} 25%, transparent), 0 6px 16px -4px ${color}99`
  } else if (inProgress) {
    style.background = `conic-gradient(${color} 0deg 200deg, color-mix(in srgb, ${color} 18%, var(--surface)) 200deg 360deg)`
    style.boxShadow = `0 4px 10px -3px ${color}66`
  } else {
    style.background = 'var(--surface)'
    style.border = `3px solid ${color}`
  }

  return (
    <button
      onClick={onOpen}
      className="relative flex shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
      style={style}
      disabled={false}
    >
      {locked && <Lock size={Math.round(size * 0.34)} color="var(--text-muted)" />}
      {!locked && done && <Check size={Math.round(size * 0.42)} color="white" strokeWidth={3} />}
      {!locked && inProgress && (
        <span className="flex h-[70%] w-[70%] items-center justify-center rounded-full" style={{ background: 'var(--surface)' }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        </span>
      )}
      {!locked && !done && !inProgress && (
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      )}
      {!locked && done && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'var(--yellow)' }}>
          <Star size={11} color="white" fill="white" />
        </span>
      )}
    </button>
  )
}

function RefreshView({
  module: mod,
  patterns,
  onDone,
}: {
  module: RoadmapModule
  patterns: Pattern[]
  onDone: () => void
}) {
  const color = LEVEL_COLORS[mod.level]
  const linkedPattern = patternsForModule(mod, patterns)[0]
  const cards = useLiveQuery(
    () => (linkedPattern ? db.flashcards.where('patternId').equals(linkedPattern.id).limit(3).toArray() : []),
    [linkedPattern?.id],
  )

  const finish = async () => {
    await markModuleRefreshed(mod.id)
    onDone()
  }

  return (
    <motion.div className="mx-auto max-w-2xl space-y-4" variants={staggerContainer} initial="hidden" animate="show">
      <motion.button variants={fadeUpItem} onClick={onDone} className="text-sm font-semibold text-[var(--text-muted)]">
        ← Back to Roadmap
      </motion.button>
      <motion.div variants={fadeUpItem} className="flex items-center gap-2">
        <IconBadge icon={GraduationCap} color="var(--teal)" size={40} />
        <div>
          <p className="meta-label" style={{ color: 'var(--teal)' }}>Quick refresh</p>
          <h1 className="page-title">{mod.title}</h1>
        </div>
      </motion.div>

      {linkedPattern ? (
        <motion.section variants={fadeUpItem} className="card space-y-2 p-4">
          <h2 className="section-header text-sm">{linkedPattern.name}</h2>
          <p className="body-text"><PatternText segments={linkedPattern.structureTemplate} /></p>
          <p className="body-text text-sm text-[var(--text-muted)]">{linkedPattern.ruleExplanation}</p>
        </motion.section>
      ) : (
        <motion.p variants={fadeUpItem} className="body-text text-sm text-[var(--text-muted)]">{mod.description}</motion.p>
      )}

      {cards && cards.length > 0 && (
        <motion.section variants={fadeUpItem} className="space-y-2">
          <h2 className="section-header text-sm">A few flashcards, out of cycle</h2>
          {cards.map((c) => (
            <div key={c.id} className="card p-3">
              <p className="font-bold">{c.front}</p>
              <p className="body-text text-sm text-[var(--text-muted)]">{c.back}</p>
            </div>
          ))}
        </motion.section>
      )}

      <motion.button variants={fadeUpItem} onClick={finish} className="btn w-full py-2 text-sm text-white" style={{ background: color }}>
        Done — mark refreshed
      </motion.button>
    </motion.div>
  )
}

function AddModuleForm({
  onSubmit,
  onCancel,
  color,
}: {
  onSubmit: (title: string) => void
  onCancel: () => void
  color: string
}) {
  const [title, setTitle] = useState('')
  return (
    <form
      className="mb-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(title)
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Module title"
        className="flex-1 rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
      />
      <button type="submit" className="btn px-3 py-1.5 text-sm text-white" style={{ background: color }}>
        Add
      </button>
      <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-[var(--text-muted)]">
        Cancel
      </button>
    </form>
  )
}

function ModuleRow({
  mod,
  color,
  locked,
  recommendedAfter,
  hasLesson,
  difficulty,
  onOpen,
  onUpdate,
  onDelete,
  onMove,
}: {
  mod: RoadmapModule
  color: string
  locked: boolean
  recommendedAfter?: string
  hasLesson: boolean
  difficulty?: LessonDifficulty
  onOpen: () => void
  onUpdate: (patch: Partial<RoadmapModule>) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="relative rounded-xl border-2 p-3 transition-colors"
      style={{ borderColor: mod.status === 'done' ? color : 'var(--border)', opacity: locked ? 0.7 : 1 }}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button onClick={() => onMove(-1)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">▲</button>
          <button onClick={() => onMove(1)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">▼</button>
        </div>
        <button className="flex-1 text-left" onClick={onOpen}>
          <span className={`font-semibold ${mod.status === 'done' ? 'line-through text-[var(--text-muted)]' : ''}`}>
            {locked && <Lock size={12} className="mr-1 inline text-[var(--text-muted)]" />}
            {mod.title}
          </span>
          {hasLesson && <span className="ml-2 text-xs font-bold" style={{ color }}>Lesson →</span>}
          {difficulty && (
            <span
              className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ background: DIFFICULTY_COLORS[difficulty] }}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          )}
        </button>
        {hasLesson ? (
          <span
            className="rounded-full px-2 py-1 text-xs font-bold"
            style={{
              background: mod.status === 'done' ? color : 'var(--surface-alt)',
              color: mod.status === 'done' ? 'white' : 'var(--text-muted)',
            }}
          >
            {STATUS_LABEL[mod.status]}
          </span>
        ) : (
          <select
            value={mod.status}
            onChange={(e) => onUpdate({ status: e.target.value as ModuleStatus })}
            className="rounded-full border-2 px-2 py-1 text-xs font-bold"
            style={{ borderColor: color, color: mod.status === 'not_started' ? 'var(--text-muted)' : color }}
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
        <button onClick={() => setExpanded((v) => !v)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
          {expanded ? 'Less' : 'Notes'}
        </button>
        <button onClick={onDelete} className="text-[var(--text-muted)] hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>

      {locked && recommendedAfter && (
        <p className="mt-1 pl-6 text-xs text-[var(--text-muted)]">Recommended after completing "{recommendedAfter}"</p>
      )}

      {expanded && (
        <div className="mt-3 space-y-2 pl-6">
          <textarea
            value={mod.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
          />
          <textarea
            value={mod.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Notes / resource links"
            rows={2}
            className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      )}
    </div>
  )
}

function LessonView({
  module: mod,
  prevModule,
  patterns,
  onBack,
  onUpdate,
}: {
  module: RoadmapModule
  prevModule: RoadmapModule | null
  patterns: Pattern[]
  onBack: () => void
  onUpdate: (patch: Partial<RoadmapModule>) => void
}) {
  const color = LEVEL_COLORS[mod.level]
  const lesson = LESSON_CONTENT[mod.title]
  const locked = !!prevModule && prevModule.status !== 'done'
  const [burst, setBurst] = useState(0)
  const [ruleRevealed, setRuleRevealed] = useState(false)
  const [activeSectionIdx, setActiveSectionIdx] = useState(0)
  const { showToast } = useToast()

  useEffect(() => {
    if (!mod.lessonViewed) {
      onUpdate({ lessonViewed: true, status: mod.status === 'not_started' ? 'in_progress' : mod.status })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.id])

  const linkedPattern = lesson?.linkPatternName ? patterns.find((p) => p.name === lesson.linkPatternName) : undefined
  const fallbackPatterns = !lesson ? patternsForModule(mod, patterns) : []

  const canMarkDone = lesson ? (mod.quizBestScore ?? 0) >= QUIZ_PASS_THRESHOLD : true
  const passed = (mod.quizBestScore ?? 0) >= QUIZ_PASS_THRESHOLD

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const sections = [
    { id: 'lv-notice', label: 'Notice the pattern' },
    { id: 'lv-rule', label: 'The rule' },
    { id: 'lv-practice', label: 'Practice' },
    { id: 'lv-quiz', label: 'Quick check' },
  ]

  // Lightweight scroll-spy so the sticky sidebar reads as "Section X of Y"
  // rather than a flat list — the lesson feels like a navigable document.
  useEffect(() => {
    if (!lesson) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          const idx = sections.findIndex((s) => s.id === visible[0].target.id)
          if (idx !== -1) setActiveSectionIdx(idx)
        }
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, ruleRevealed])

  // A "signature moment" (Part 1 §5): completing a lesson awards XP, may
  // trigger a level bonus/level-up and badge unlocks, and gets the fuller
  // celebration treatment (confetti + mascot + toast) rather than the
  // quick, understated animation used everywhere else.
  const markDone = async () => {
    const levelBefore = levelForXp(await totalXp())

    await onUpdate({ status: 'done', lastPracticedAt: Date.now() })
    await awardXp('module_complete', mod.id)

    const levelSiblings = await db.modules.where('level').equals(mod.level).toArray()
    const levelNowComplete = levelSiblings.every((m) => m.id === mod.id || m.status === 'done')
    if (levelNowComplete) await awardXp('level_complete', mod.level)

    const { newlyUnlocked } = await evaluateBadges()
    const levelAfter = levelForXp(await totalXp())

    setBurst((b) => b + 1)
    showToast('Lesson complete — great work!', '🎓')
    if (levelNowComplete) showToast(`Level ${mod.level} complete! +250 XP`, '🏆')
    if (levelAfter > levelBefore) showToast(`Level up! You're now level ${levelAfter}`, '⭐')
    newlyUnlocked.forEach((b) => showToast(`Badge unlocked: ${b.def.name}!`, '🏅'))
  }

  return (
    <motion.div className="relative mx-auto max-w-3xl" variants={staggerContainer} initial="hidden" animate="show">
      <Confetti trigger={burst} />
      <motion.button variants={fadeUpItem} onClick={onBack} className="mb-4 text-sm font-semibold text-[var(--text-muted)]">
        ← Back to Roadmap
      </motion.button>

      <motion.div
        variants={fadeUpItem}
        className="blob-decoration card mb-5 flex items-center gap-3 p-4"
        style={{ ['--blob-color' as string]: color, ['--blob-color-2' as string]: 'var(--blue)' }}
      >
        <div className="blob-content">
          <IconBadge icon={lesson?.icon ?? GraduationCap} color={color} size={48} />
        </div>
        <div className="blob-content">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: color }}>
              {mod.level}
            </span>
            {lesson && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ background: DIFFICULTY_COLORS[lesson.difficulty] }}
              >
                {DIFFICULTY_LABELS[lesson.difficulty]}
              </span>
            )}
            {locked && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                <Lock size={12} /> Recommended after "{prevModule!.title}"
              </span>
            )}
          </div>
          <h1 className="page-title">{mod.title}</h1>
        </div>
      </motion.div>

      {mod.relevanceNote && (
        <motion.p variants={fadeUpItem} className="mb-5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-muted)]" style={{ background: 'var(--surface-alt)' }}>
          💡 {mod.relevanceNote}
        </motion.p>
      )}

      <div className={lesson ? 'grid gap-6 md:grid-cols-[1fr_170px]' : ''}>
        <div className="space-y-5">
          {!lesson && (
        <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
          <p className="text-sm text-[var(--text-muted)]">
            📘 Full lesson content for this module is coming soon. In the meantime, here's what's here so far —
            you can still track your own progress manually below.
          </p>
          {mod.description && <p className="text-sm">{mod.description}</p>}
          {fallbackPatterns.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Related patterns</p>
              {fallbackPatterns.map((p) => (
                <Link key={p.id} to="/practice?tab=patterns" className="block rounded-xl border-2 border-[var(--border)] p-2 text-sm hover:border-[var(--accent)]">
                  {p.name}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-semibold">Status</span>
            <select
              value={mod.status}
              onChange={(e) => onUpdate({ status: e.target.value as ModuleStatus })}
              className="rounded-full border-2 px-3 py-1 text-sm font-bold"
              style={{ borderColor: color, color }}
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </motion.section>
      )}

      {lesson && (
        <>
          <motion.section id="lv-notice" variants={fadeUpItem} className="space-y-2 scroll-mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>First, notice the pattern</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Read these examples before the rule is explained — see what you can figure out yourself.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {lesson.examples.map((ex, i) => {
                const Icon = CONTEXT_ICON[ex.context]
                return (
                  <div key={i} className="card flex items-start gap-2 p-2.5">
                    <IconBadge icon={Icon} color={color} size={26} />
                    <div className="min-w-0">
                      <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {ex.context}
                      </span>
                      <p className="pull-quote text-sm" style={{ ['--quote-color' as string]: color }}>
                        {ex.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>

          <motion.section variants={fadeUpItem} className="card mt-5 space-y-3 p-4" style={{ background: 'var(--blue-soft)' }}>
            <div className="flex items-center gap-2">
              <IconBadge icon={Lightbulb} color="var(--blue)" size={30} />
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--blue)' }}>Think about it</h2>
            </div>
            <p className="text-sm font-semibold">{lesson.guidedQuestion}</p>
            {!ruleRevealed && (
              <button onClick={() => setRuleRevealed(true)} className="btn px-4 py-1.5 text-sm text-white" style={{ background: 'var(--blue)' }}>
                Reveal the rule
              </button>
            )}
          </motion.section>

          {ruleRevealed && (
            <motion.div
              id="lv-rule"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 grid gap-4 scroll-mt-4 md:grid-cols-2"
            >
              <section className="card space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <IconBadge icon={GraduationCap} color={color} size={30} />
                  <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>The rule</h2>
                </div>
                {lesson.concept.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed">{para}</p>
                ))}
              </section>

              <section className="card space-y-2 p-4" style={{ background: 'var(--orange-soft)' }}>
                <div className="flex items-center gap-2">
                  <IconBadge icon={AlertTriangle} color="var(--orange)" size={30} />
                  <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--orange)' }}>Watch out for this</h2>
                </div>
                <ul className="space-y-2 text-sm">
                  {lesson.commonMistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--orange)' }} />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </motion.div>
          )}

          <motion.section id="lv-practice" variants={fadeUpItem} className="mt-5 space-y-3 scroll-mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>Practice</h2>
            <div className="flex flex-wrap gap-3">
              {lesson.linkDecks?.map((deck) => (
                <Link key={deck} to="/practice?tab=flashcards" className="btn btn-secondary px-3 py-1.5 text-sm">
                  Review "{deck}" flashcards
                </Link>
              ))}
              {linkedPattern && (
                <Link to={`/practice?tab=drills&patternId=${linkedPattern.id}`} className="btn px-3 py-1.5 text-sm text-white" style={{ background: color }}>
                  Sentence Production Drill
                </Link>
              )}
            </div>
            {linkedPattern?.recognitionParagraph && (
              <SpotThePattern
                tokens={linkedPattern.recognitionParagraph}
                patternName={linkedPattern.name}
                ruleExplanation={linkedPattern.ruleExplanation}
              />
            )}
          </motion.section>

          <motion.section id="lv-quiz" variants={fadeUpItem} className="card mt-5 space-y-3 p-4 scroll-mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>Quick check</h2>
            <Quiz
              questions={lesson.quiz}
              color={color}
              onComplete={(pct) => onUpdate({ quizBestScore: Math.max(mod.quizBestScore ?? 0, pct) })}
            />
          </motion.section>

          <motion.section variants={fadeUpItem} className="mt-5 text-center">
            {mod.status === 'done' ? (
              <div className="flex flex-col items-center gap-2">
                <Mascot pose="celebrate" size={56} color={color} />
                <p className="font-bold" style={{ color }}>Module complete</p>
              </div>
            ) : (
              <button
                onClick={markDone}
                disabled={!canMarkDone}
                className="btn px-6 py-2 text-sm text-white disabled:opacity-40"
                style={{ background: color }}
              >
                Mark as done
              </button>
            )}
            {!canMarkDone && mod.status !== 'done' && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Score {QUIZ_PASS_THRESHOLD}%+ on the quick check above to mark this module done.
              </p>
            )}
            {passed && mod.status !== 'done' && (
              <p className="mt-1 text-xs" style={{ color }}>Best score: {mod.quizBestScore}% — nice, you've passed!</p>
            )}
          </motion.section>
        </>
      )}
        </div>

        {lesson && (
          <motion.nav variants={fadeUpItem} className="hidden md:block">
            <div className="sticky top-4 card space-y-1 p-3">
              <p className="meta-label mb-1" style={{ color }}>
                Section {activeSectionIdx + 1} of {sections.length}
              </p>
              <p className="mb-1 text-xs font-bold text-[var(--text)]">{sections[activeSectionIdx].label}</p>
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition-colors"
                  style={{
                    background: i === activeSectionIdx ? 'var(--surface-alt)' : 'transparent',
                    color: i === activeSectionIdx ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.div>
  )
}
