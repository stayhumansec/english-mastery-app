import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import PatternText from '../../components/PatternText'
import Confetti from '../../components/motion/Confetti'
import { useToast } from '../../components/motion/ToastProvider'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { awardXp } from '../../lib/xp'
import { evaluateBadges } from '../../lib/badges'
import { FEATURE_COLORS, type DrillAttempt, type DrillConfidence, type DrillSelfCheck, type Pattern, type SelfCheckAnswer } from '../../lib/types'

const SELF_CHECK_QUESTIONS: Array<{ key: keyof DrillSelfCheck; label: string }> = [
  { key: 'grammarCorrect', label: 'Was your grammar correct?' },
  { key: 'soundsNatural', label: 'Did it sound natural, the way a native speaker would phrase it?' },
  { key: 'rightRegister', label: 'Was the tone/formality right for the scenario?' },
]

const SESSION_SIZE = 4

interface QueueItem {
  attemptId?: string // set when resurfacing an existing "unsure" attempt
  pattern?: Pattern
  promptContext: string
}

export default function DrillsPage() {
  const [searchParams] = useSearchParams()
  const focusPatternId = searchParams.get('patternId')

  const patterns = useLiveQuery(() => db.patterns.toArray(), [])
  const scenarioPrompts = useLiveQuery(() => db.scenarioPrompts.toArray(), [])
  const attempts = useLiveQuery(() => db.drillAttempts.orderBy('createdAt').reverse().toArray(), [])

  const [sessionStarted, setSessionStarted] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [index, setIndex] = useState(0)
  const [sentence, setSentence] = useState('')
  const [burst, setBurst] = useState(0)
  const [feedbackFor, setFeedbackFor] = useState<QueueItem | null>(null)
  const [pendingAttemptId, setPendingAttemptId] = useState<string | null>(null)
  const [selfCheck, setSelfCheck] = useState<Partial<DrillSelfCheck>>({})
  const { showToast } = useToast()
  const color = FEATURE_COLORS.drills

  const focusPattern = patterns?.find((p) => p.id === focusPatternId)

  const buildQueue = () => {
    if (!patterns || patterns.length === 0 || !scenarioPrompts || scenarioPrompts.length === 0) return
    const items: QueueItem[] = []

    if (!focusPatternId) {
      const unsure = (attempts ?? []).filter((a) => a.confidence === 'unsure').slice(0, 2)
      for (const a of unsure) {
        items.push({
          attemptId: a.id,
          pattern: patterns.find((p) => p.id === a.patternId),
          promptContext: a.promptContext,
        })
      }
    }

    const pool = focusPatternId ? patterns.filter((p) => p.id === focusPatternId) : patterns
    while (items.length < SESSION_SIZE) {
      const pattern = pool[Math.floor(Math.random() * pool.length)]
      const scenario = scenarioPrompts[Math.floor(Math.random() * scenarioPrompts.length)]
      items.push({ pattern, promptContext: scenario.prompt })
    }

    setQueue(items)
    setIndex(0)
    setSentence('')
    setSessionStarted(true)
  }

  const current = queue[index]

  const submit = async (confidence: DrillConfidence) => {
    if (!current || !sentence.trim()) return
    const id = current.attemptId ?? uuid()
    if (current.attemptId) {
      await db.drillAttempts.update(current.attemptId, {
        sentence: sentence.trim(),
        confidence,
        date: todayIso(),
      })
    } else {
      await db.drillAttempts.add({
        id,
        date: todayIso(),
        patternId: current.pattern?.id,
        promptContext: current.promptContext,
        sentence: sentence.trim(),
        confidence,
        createdAt: Date.now(),
      })
    }
    // Show a model example before advancing — the "feedback" a teacher
    // would give even without live grading.
    setPendingAttemptId(id)
    setSelfCheck({})
    setFeedbackFor(current)
  }

  const answerSelfCheck = (key: keyof DrillSelfCheck, value: SelfCheckAnswer) => {
    setSelfCheck((prev) => ({ ...prev, [key]: value }))
  }

  const selfCheckComplete =
    !!selfCheck.grammarCorrect && !!selfCheck.soundsNatural && !!selfCheck.rightRegister

  const goNext = async () => {
    if (pendingAttemptId && selfCheckComplete) {
      await db.drillAttempts.update(pendingAttemptId, { selfCheck: selfCheck as DrillSelfCheck })
      await awardXp('drill_sentence', pendingAttemptId)
      await evaluateBadges()
    }
    setFeedbackFor(null)
    setPendingAttemptId(null)
    setSelfCheck({})
    setSentence('')
    if (index + 1 >= queue.length) {
      setSessionStarted(false)
      setQueue([])
      setBurst((b) => b + 1)
      showToast('Drill session complete!', '✨')
    } else {
      setIndex((i) => i + 1)
    }
  }

  const markConfident = (attempt: DrillAttempt) => db.drillAttempts.update(attempt.id, { confidence: 'confident' })

  const unsureCount = useMemo(() => attempts?.filter((a) => a.confidence === 'unsure').length ?? 0, [attempts])

  return (
    <motion.div className="relative space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <Confetti trigger={burst} />
      <motion.div variants={fadeUpItem}>
        <h1 className="page-title" style={{ color }}>Sentence Production Drills ✨</h1>
        <p className="body-text text-[var(--text-muted)]">
          Write your own sentence — free production, not fill-in-the-blank. 3-5 per session.
        </p>
      </motion.div>

      {focusPattern && !sessionStarted && (
        <motion.div variants={fadeUpItem} className="card p-3 text-sm">
          Focused on <span className="font-bold">{focusPattern.name}</span> —{' '}
          <PatternText segments={focusPattern.structureTemplate} />
        </motion.div>
      )}

      {!sessionStarted ? (
        <motion.div variants={fadeUpItem} className="card mx-auto max-w-sm space-y-3 p-6 text-center">
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {unsureCount > 0 && !focusPatternId
              ? `${unsureCount} sentence(s) marked "unsure" will resurface in this session.`
              : 'Ready for a quick drill session?'}
          </p>
          <button
            onClick={buildQueue}
            disabled={!patterns?.length || !scenarioPrompts?.length}
            className="btn w-full py-2 text-sm text-white disabled:opacity-40"
            style={{ background: color }}
          >
            Start session ({SESSION_SIZE} sentences)
          </button>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>Sentence {index + 1} / {queue.length}</span>
            {current.attemptId && <span className="text-amber-500">resurfaced — marked unsure before</span>}
          </div>

          <div className="card space-y-2 p-4">
            {current.pattern && (
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{current.pattern.name} ({current.pattern.level})</p>
                <p><PatternText segments={current.pattern.structureTemplate} /></p>
              </div>
            )}
            <div className="border-t border-[var(--border)] pt-2">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Scenario</p>
              <p className="text-sm">{current.promptContext}</p>
            </div>
          </div>

          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Write your sentence using the pattern above…"
            rows={3}
            disabled={!!feedbackFor}
            className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm disabled:opacity-70"
          />

          {!feedbackFor ? (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => submit('unsure')} className="btn border-2 border-amber-400 py-2 text-sm font-bold text-amber-600" style={{ background: 'transparent', boxShadow: 'none' }}>
                Save — unsure
              </button>
              <button onClick={() => submit('confident')} className="btn py-2 text-sm text-white" style={{ background: 'var(--accent)' }}>
                Save — confident
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackFor.pattern?.examples[0] && (
                <div className="card space-y-1 p-3" style={{ background: 'var(--blue-soft)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--blue)' }}>
                    Model example using this pattern
                  </p>
                  <p className="text-sm"><PatternText segments={feedbackFor.pattern.examples[0].segments} /></p>
                  <p className="text-xs text-[var(--text-muted)]">Compare it with your sentence — what's different?</p>
                </div>
              )}

              <div className="card space-y-3 p-3">
                <p className="section-header text-sm">Quick self-check</p>
                {SELF_CHECK_QUESTIONS.map((q) => (
                  <div key={q.key} className="space-y-1.5">
                    <p className="body-text text-sm">{q.label}</p>
                    <div className="flex gap-2">
                      {(['yes', 'no', 'unsure'] as SelfCheckAnswer[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => answerSelfCheck(q.key, option)}
                          className="rounded-full px-3 py-1 text-xs font-bold capitalize"
                          style={
                            selfCheck[q.key] === option
                              ? { background: color, color: 'white' }
                              : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }
                          }
                        >
                          {option === 'unsure' ? 'Not sure' : option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={!selfCheckComplete}
                className="btn w-full py-2 text-sm text-white disabled:opacity-40"
                style={{ background: color }}
              >
                Next sentence
              </button>
            </div>
          )}
        </div>
      )}

      <motion.section variants={fadeUpItem} className="space-y-2">
        <h2 className="section-header text-sm">Past attempts</h2>
        {attempts?.length === 0 && <p className="text-sm text-[var(--text-muted)]">✨ No attempts yet — start a session above!</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {attempts?.map((a) => (
            <div key={a.id} className="card flex flex-col gap-1.5 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="meta-label">
                  {a.date} · {patterns?.find((p) => p.id === a.patternId)?.name ?? 'general'}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                    a.confidence === 'unsure' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {a.confidence}
                </span>
              </div>
              <p className="flex-1">{a.sentence}</p>
              {a.confidence === 'unsure' && (
                <button onClick={() => markConfident(a)} className="text-xs font-bold hover:underline" style={{ color }}>
                  Mark confident now
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}
