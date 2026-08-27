import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import ProgressBar from '../../components/ProgressBar'
import Confetti from '../../components/motion/Confetti'
import Quiz from '../../components/Quiz'
import SpotThePattern from '../../components/SpotThePattern'
import { useToast } from '../../components/motion/ToastProvider'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { LESSON_CONTENT, QUIZ_PASS_THRESHOLD } from '../../lib/lessonContent'
import { patternsForModule } from '../../lib/weeklyFocus'
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
  Coffee,
  Feather,
  GraduationCap,
  Lightbulb,
  Lock,
  Map,
  Plus,
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

  if (!modules) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  const overall = levelProgress(modules)

  const updateModule = async (id: string, patch: Partial<RoadmapModule>) => {
    await db.modules.update(id, patch)
    if (patch.status === 'done') showToast('Module complete — nice work!', '🎉')
  }

  const openLesson = (id: string) => setSearchParams({ lesson: id })
  const closeLesson = () => setSearchParams({})

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
          <h1 className="text-2xl font-black">CEFR Roadmap</h1>
          <p className="text-sm font-medium text-[var(--text-muted)]">
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
        return (
          <motion.section
            key={level}
            variants={fadeUpItem}
            className="card p-4"
            style={{ borderLeft: `6px solid ${color}` }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ background: color }}
                >
                  {level}
                </span>
                <h2 className="font-bold">Level {level}</h2>
              </div>
              <button
                onClick={() => setAddingFor(level)}
                className="flex items-center gap-1 text-xs font-bold hover:underline"
                style={{ color }}
              >
                <Plus size={14} /> Add module
              </button>
            </div>
            <div className="mb-3 max-w-sm">
              <ProgressBar value={levelProgress(levelModules)} color={color} thick />
            </div>

            {addingFor === level && (
              <AddModuleForm
                onCancel={() => setAddingFor(null)}
                onSubmit={(title) => addModule(level, title)}
                color={color}
              />
            )}

            <div className="space-y-2">
              {levelModules.map((mod, i) => {
                const prevDone = i === 0 || levelModules[i - 1].status === 'done'
                return (
                  <ModuleRow
                    key={mod.id}
                    mod={mod}
                    color={color}
                    locked={!prevDone}
                    recommendedAfter={i > 0 ? levelModules[i - 1].title : undefined}
                    hasLesson={!!LESSON_CONTENT[mod.title]}
                    difficulty={LESSON_CONTENT[mod.title]?.difficulty}
                    onOpen={() => openLesson(mod.id)}
                    onUpdate={(patch) => updateModule(mod.id, patch)}
                    onDelete={() => deleteModule(mod.id)}
                    onMove={(dir) => moveModule(mod, dir)}
                  />
                )
              })}
              {levelModules.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No modules yet — add your first one above!</p>
              )}
            </div>
          </motion.section>
        )
      })}
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

  const markDone = () => {
    onUpdate({ status: 'done' })
    setBurst((b) => b + 1)
    showToast('Lesson complete — great work!', '🎓')
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const sections = [
    { id: 'lv-notice', label: 'Notice the pattern' },
    { id: 'lv-rule', label: 'The rule' },
    { id: 'lv-practice', label: 'Practice' },
    { id: 'lv-quiz', label: 'Quick check' },
  ]

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
          <h1 className="text-2xl font-black">{mod.title}</h1>
        </div>
      </motion.div>

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
                <Link key={p.id} to="/patterns" className="block rounded-xl border-2 border-[var(--border)] p-2 text-sm hover:border-[var(--accent)]">
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
                <Link key={deck} to="/flashcards" className="btn btn-secondary px-3 py-1.5 text-sm">
                  Review "{deck}" flashcards
                </Link>
              ))}
              {linkedPattern && (
                <Link to={`/drills?patternId=${linkedPattern.id}`} className="btn px-3 py-1.5 text-sm text-white" style={{ background: color }}>
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
              <p className="font-bold" style={{ color }}>✅ Module complete</p>
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
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">On this page</p>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
