import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Blocks, Briefcase, Coffee, Feather, ShieldAlert, TrendingDown } from 'lucide-react'
import { db } from '../../lib/db'
import PatternText, { PatternRoleLegend } from '../../components/PatternText'
import SpotThePattern from '../../components/SpotThePattern'
import IconBadge from '../../components/IconBadge'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { computeWeakSpots, type WeakSpot } from '../../lib/weakSpots'
import { CEFR_LEVELS, FEATURE_COLORS, type CefrLevel, type ExampleContext, type Pattern } from '../../lib/types'

const CONTEXT_ICON: Record<ExampleContext, typeof Coffee> = {
  everyday: Coffee,
  professional: Briefcase,
  storytelling: Feather,
}

export default function PatternsPage() {
  const patterns = useLiveQuery(() => db.patterns.toArray(), [])
  const [levelFilter, setLevelFilter] = useState<CefrLevel | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Pattern | null>(null)
  const [weakSpots, setWeakSpots] = useState<WeakSpot[]>([])
  const [searchParams] = useSearchParams()

  useEffect(() => {
    computeWeakSpots().then(setWeakSpots)
  }, [])

  useEffect(() => {
    const openId = searchParams.get('openPatternId')
    if (openId && patterns) {
      const p = patterns.find((pp) => pp.id === openId)
      if (p) setSelected(p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, patterns])

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
        <h1 className="page-title" style={{ color: FEATURE_COLORS.patterns }}>Pattern Library 🧩</h1>
        <p className="body-text text-[var(--text-muted)]">See how the structure works, not just what the rule says.</p>
      </motion.div>

      <motion.div variants={fadeUpItem}>
        <PatternRoleLegend />
      </motion.div>

      {weakSpots.length > 0 && (
        <motion.section variants={fadeUpItem} className="card space-y-2 p-4">
          <div className="flex items-center gap-2">
            <IconBadge icon={TrendingDown} color="var(--orange)" size={30} />
            <h2 className="section-header text-sm">Weak spots</h2>
          </div>
          <div className="space-y-2">
            {weakSpots.map((spot) => (
              <div key={spot.patternId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[var(--border)] p-2">
                <div>
                  <p className="text-sm font-bold">{spot.pattern?.name ?? 'Unknown pattern'}</p>
                  <p className="meta-label">{spot.score} attempts to revisit · last {spot.lastAttemptedDate}</p>
                </div>
                <div className="flex gap-2">
                  {spot.pattern && (
                    <button onClick={() => setSelected(spot.pattern!)} className="btn btn-secondary px-3 py-1 text-xs">
                      Review pattern
                    </button>
                  )}
                  <Link to={`/practice?tab=drills&patternId=${spot.patternId}`} className="btn px-3 py-1 text-xs text-white" style={{ background: 'var(--orange)' }}>
                    Try again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

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

  const color = FEATURE_COLORS.patterns

  return (
    <motion.div className="mx-auto max-w-3xl space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      <motion.button variants={fadeUpItem} onClick={onBack} className="text-sm font-semibold text-[var(--text-muted)]">← All patterns</motion.button>

      <motion.div
        variants={fadeUpItem}
        className="blob-decoration card flex items-center gap-3 p-4"
        style={{ ['--blob-color' as string]: color, ['--blob-color-2' as string]: 'var(--blue)' }}
      >
        <div className="blob-content"><IconBadge icon={Blocks} color={color} size={44} /></div>
        <div className="blob-content">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">{pattern.name}</h1>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: color }}
            >
              {pattern.level}
            </span>
          </div>
          <p className="body-text text-sm text-[var(--text-muted)]">{pattern.category}</p>
        </div>
      </motion.div>

      {pattern.relevanceNote && (
        <motion.p variants={fadeUpItem} className="rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-muted)]" style={{ background: 'var(--surface-alt)' }}>
          💡 {pattern.relevanceNote}
        </motion.p>
      )}

      <motion.section variants={fadeUpItem} className="card p-4">
        <h2 className="mb-2 text-sm font-bold text-[var(--text-muted)]">Structure</h2>
        <p className="text-lg"><PatternText segments={pattern.structureTemplate} /></p>
      </motion.section>

      <motion.section variants={fadeUpItem} className="space-y-2">
        <h2 className="text-sm font-bold text-[var(--text-muted)]">Examples</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {pattern.examples.map((ex, i) => (
            <div key={i} className="card flex items-start gap-2 p-2.5">
              <IconBadge icon={CONTEXT_ICON[ex.context]} color={color} size={26} />
              <div>
                <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{ex.context}</span>
                <p className="pull-quote text-sm" style={{ ['--quote-color' as string]: color }}><PatternText segments={ex.segments} /></p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div variants={fadeUpItem} className="grid gap-4 md:grid-cols-2">
        <section className="card space-y-2 p-4">
          <div className="flex items-center gap-2">
            <IconBadge icon={AlertTriangle} color="var(--orange)" size={30} />
            <h2 className="text-sm font-bold text-[var(--text-muted)]">Common mistake</h2>
          </div>
          <p className="text-sm">{pattern.commonMistake}</p>
        </section>
        <section className="card space-y-2 rounded-2xl p-4" style={{ background: 'var(--pink-soft)' }}>
          <div className="flex items-center gap-2">
            <IconBadge icon={ShieldAlert} color="var(--pink)" size={30} />
            <h2 className="text-sm font-bold text-[var(--text-muted)]">Often confused with</h2>
          </div>
          <p className="text-sm text-red-500 line-through decoration-red-400">{pattern.contrastWrong}</p>
          <p className="text-sm text-[var(--text-muted)]">{pattern.contrastNote}</p>
        </section>
      </motion.div>

      <section className="flex flex-wrap gap-3">
        <Link to={`/practice?tab=drills&patternId=${pattern.id}`} className="btn px-4 py-2 text-sm text-white" style={{ background: FEATURE_COLORS.patterns }}>
          Practice in Sentence Drills
        </Link>
        {pattern.recognitionParagraph && (
          <button onClick={() => setShowRecognition((v) => !v)} className="btn btn-secondary px-4 py-2 text-sm">
            {showRecognition ? 'Hide' : 'Spot the Pattern warm-up'}
          </button>
        )}
      </section>

      {showRecognition && pattern.recognitionParagraph && (
        <SpotThePattern
          tokens={pattern.recognitionParagraph}
          patternName={pattern.name}
          ruleExplanation={pattern.ruleExplanation}
        />
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
