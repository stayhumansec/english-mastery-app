import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import PatternText, { PatternRoleLegend } from '../../components/PatternText'
import Confetti from '../../components/motion/Confetti'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { CEFR_LEVELS, FEATURE_COLORS, type CefrLevel, type Pattern, type RecognitionToken } from '../../lib/types'

export default function PatternsPage() {
  const patterns = useLiveQuery(() => db.patterns.toArray(), [])
  const [levelFilter, setLevelFilter] = useState<CefrLevel | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Pattern | null>(null)

  const categories = useMemo(
    () => (patterns ? [...new Set(patterns.map((p) => p.category))].sort() : []),
    [patterns],
  )

  const filtered = useMemo(() => {
    if (!patterns) return []
    return patterns.filter(
      (p) =>
        (levelFilter === 'all' || p.level === levelFilter) &&
        (categoryFilter === 'all' || p.category === categoryFilter) &&
        (search.trim() === '' || p.name.toLowerCase().includes(search.trim().toLowerCase())),
    )
  }, [patterns, levelFilter, categoryFilter, search])

  if (!patterns) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  if (selected) {
    return <PatternDetail pattern={selected} onBack={() => setSelected(null)} />
  }

  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUpItem}>
        <h1 className="text-2xl font-black" style={{ color: FEATURE_COLORS.patterns }}>Pattern Library 🧩</h1>
        <p className="text-sm font-medium text-[var(--text-muted)]">See how the structure works, not just what the rule says.</p>
      </motion.div>

      <motion.div variants={fadeUpItem}>
        <PatternRoleLegend />
      </motion.div>

      <motion.div variants={fadeUpItem} className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patterns…"
          className="flex-1 min-w-[10rem] rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-1.5 text-sm"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as CefrLevel | 'all')}
          className="rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1.5 text-sm"
        >
          <option value="all">All levels</option>
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1.5 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={fadeUpItem} className="grid gap-2 sm:grid-cols-2">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="card space-y-1 p-3 text-left transition-colors"
            style={{ borderLeft: `6px solid ${FEATURE_COLORS.patterns}` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{p.name}</span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">{p.level}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{p.category}</p>
            <PatternText segments={p.structureTemplate} />
          </button>
        ))}
        {filtered.length === 0 && <p className="text-sm text-[var(--text-muted)]">🔍 No patterns match — try a different search or filter.</p>}
      </motion.div>
    </motion.div>
  )
}

function PatternDetail({ pattern, onBack }: { pattern: Pattern; onBack: () => void }) {
  const linkedCards = useLiveQuery(
    () => db.flashcards.where('patternId').equals(pattern.id).toArray(),
    [pattern.id],
  )
  const [showRecognition, setShowRecognition] = useState(false)

  return (
    <motion.div className="mx-auto max-w-2xl space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      <motion.button variants={fadeUpItem} onClick={onBack} className="text-sm font-semibold text-[var(--text-muted)]">← All patterns</motion.button>

      <motion.div variants={fadeUpItem}>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black">{pattern.name}</h1>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
            style={{ background: FEATURE_COLORS.patterns }}
          >
            {pattern.level}
          </span>
        </div>
        <p className="text-sm font-medium text-[var(--text-muted)]">{pattern.category}</p>
      </motion.div>

      <motion.section variants={fadeUpItem} className="card p-4">
        <h2 className="mb-2 text-sm font-bold text-[var(--text-muted)]">Structure</h2>
        <p className="text-lg"><PatternText segments={pattern.structureTemplate} /></p>
      </motion.section>

      <motion.section variants={fadeUpItem} className="space-y-2">
        <h2 className="text-sm font-bold text-[var(--text-muted)]">Examples</h2>
        {pattern.examples.map((ex, i) => (
          <div key={i} className="card p-3">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{ex.context}</span>
            <p><PatternText segments={ex.segments} /></p>
          </div>
        ))}
      </motion.section>

      <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-muted)]">Common mistake</h2>
          <p className="text-sm">{pattern.commonMistake}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[var(--text-muted)]">Contrast — often confused with</h2>
          <p className="text-sm text-red-500 line-through decoration-red-400">{pattern.contrastWrong}</p>
          <p className="text-sm text-[var(--text-muted)]">{pattern.contrastNote}</p>
        </div>
      </motion.section>

      <section className="flex flex-wrap gap-3">
        <Link to={`/drills?patternId=${pattern.id}`} className="btn px-4 py-2 text-sm text-white" style={{ background: FEATURE_COLORS.patterns }}>
          Practice in Sentence Drills
        </Link>
        {pattern.recognitionParagraph && (
          <button onClick={() => setShowRecognition((v) => !v)} className="btn btn-secondary px-4 py-2 text-sm">
            {showRecognition ? 'Hide' : 'Spot the Pattern warm-up'}
          </button>
        )}
      </section>

      {showRecognition && pattern.recognitionParagraph && (
        <SpotThePattern tokens={pattern.recognitionParagraph} patternName={pattern.name} />
      )}

      {linkedCards && linkedCards.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-[var(--text-muted)]">Grammar-in-Context flashcards using this pattern</h2>
          {linkedCards.map((c) => (
            <div key={c.id} className="card p-3 text-sm">
              <span className="font-medium">{c.front}</span> — {c.back}
            </div>
          ))}
        </section>
      )}
    </motion.div>
  )
}

function SpotThePattern({ tokens, patternName }: { tokens: RecognitionToken[]; patternName: string }) {
  const [selectedIdx, setSelectedIdx] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [burst, setBurst] = useState(0)

  const toggle = (i: number) => {
    if (submitted) return
    setSelectedIdx((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const reset = () => {
    setSelectedIdx(new Set())
    setSubmitted(false)
  }

  const correctCount = tokens.filter((t, i) => t.isTarget && selectedIdx.has(i)).length
  const totalTargets = tokens.filter((t) => t.isTarget).length
  const perfect = correctCount === totalTargets

  const handleSubmit = () => {
    setSubmitted(true)
    if (perfect) setBurst((b) => b + 1)
  }

  return (
    <section className="card relative space-y-3 p-4">
      <Confetti trigger={burst} />
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Spot the Pattern: {patternName}</h2>
        {submitted && (
          <span className="text-xs font-bold" style={{ color: perfect ? 'var(--accent)' : 'var(--text-muted)' }}>
            {correctCount}/{totalTargets} found {perfect ? '🎉' : ''}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--text-muted)]">Click every word or phrase that matches this pattern, then submit.</p>
      <p className="leading-loose">
        {tokens.map((t, i) => {
          const isSelected = selectedIdx.has(i)
          let className = 'cursor-pointer rounded px-0.5'
          if (!submitted) {
            className += isSelected ? ' bg-[var(--accent-soft)]' : ''
          } else if (t.isTarget && isSelected) {
            className += ' bg-emerald-200 text-emerald-900'
          } else if (t.isTarget && !isSelected) {
            className += ' bg-amber-200 text-amber-900 underline'
          } else if (!t.isTarget && isSelected) {
            className += ' bg-red-200 text-red-900 line-through'
          }
          return (
            <span key={i} onClick={() => toggle(i)} className={className}>
              {t.text}{' '}
            </span>
          )
        })}
      </p>
      <div className="flex gap-2">
        {!submitted ? (
          <button onClick={handleSubmit} className="btn px-4 py-1.5 text-sm text-white" style={{ background: FEATURE_COLORS.patterns }}>
            Submit
          </button>
        ) : (
          <button onClick={reset} className="btn btn-secondary px-4 py-1.5 text-sm">
            Try again
          </button>
        )}
      </div>
    </section>
  )
}
