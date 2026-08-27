import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { newCardScheduleDefaults, scheduleReview } from '../../lib/sm2'
import Confetti from '../../components/motion/Confetti'
import { useToast } from '../../components/motion/ToastProvider'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { awardXp } from '../../lib/xp'
import { evaluateBadges } from '../../lib/badges'
import {
  CEFR_LEVELS,
  DECK_COLORS,
  DECKS,
  FREQUENCY_TIERS,
  FREQUENCY_TIER_LABELS,
  type CefrLevel,
  type DeckName,
  type Flashcard,
  type FrequencyTier,
  type ReviewGrade,
} from '../../lib/types'
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'

const FREQUENCY_RANK: Record<FrequencyTier, number> = { top1000: 0, top3000: 1, top5000: 2, beyond: 3 }
const PRIORITIZE_FREQUENCY_KEY = 'english-mastery:prioritize-frequency'

export default function FlashcardsPage() {
  const cards = useLiveQuery(() => db.flashcards.toArray(), [])
  const [studyDeck, setStudyDeck] = useState<DeckName | 'all' | null>(null)
  const [managingDeck, setManagingDeck] = useState<DeckName | null>(null)
  const [prioritizeFrequency, setPrioritizeFrequency] = useState(
    () => localStorage.getItem(PRIORITIZE_FREQUENCY_KEY) === '1',
  )

  const togglePrioritize = () => {
    setPrioritizeFrequency((v) => {
      const next = !v
      localStorage.setItem(PRIORITIZE_FREQUENCY_KEY, next ? '1' : '0')
      return next
    })
  }

  if (!cards) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  if (studyDeck) {
    return <StudySession deck={studyDeck} cards={cards} prioritizeFrequency={prioritizeFrequency} onExit={() => setStudyDeck(null)} />
  }

  if (managingDeck) {
    return (
      <ManageDeck
        deck={managingDeck}
        cards={cards.filter((c) => c.deck === managingDeck)}
        onBack={() => setManagingDeck(null)}
      />
    )
  }

  const today = todayIso()
  const dueTotal = cards.filter((c) => c.dueDate <= today).length

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUpItem} className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="page-title">Flashcards 🃏</h1>
          <p className="body-text text-[var(--text-muted)]">{dueTotal} card(s) due today across all decks</p>
        </div>
        {dueTotal > 0 && (
          <button onClick={() => setStudyDeck('all')} className="btn btn-primary px-4 py-2 text-sm">
            Study all due
          </button>
        )}
      </motion.div>

      <motion.label variants={fadeUpItem} className="flex w-fit items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
        <input type="checkbox" checked={prioritizeFrequency} onChange={togglePrioritize} />
        Prioritize high-frequency words when studying
      </motion.label>

      <div className="grid gap-3 sm:grid-cols-2">
        {DECKS.map((deck) => {
          const color = DECK_COLORS[deck]
          const deckCards = cards.filter((c) => c.deck === deck)
          const due = deckCards.filter((c) => c.dueDate <= today).length
          const mastered = deckCards.filter((c) => c.repetitions >= 4).length
          return (
            <motion.div
              key={deck}
              variants={fadeUpItem}
              className="card space-y-2 p-4"
              style={{ borderLeft: `6px solid ${color}` }}
            >
              <div className="flex items-center gap-2">
                <Layers size={18} style={{ color }} />
                <h2 className="font-bold">{deck}</h2>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-[var(--text-muted)]">
                <span>{deckCards.length} total</span>
                <span>{due} due</span>
                <span>{mastered} mastered</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  disabled={due === 0}
                  onClick={() => setStudyDeck(deck)}
                  className="btn px-3 py-1.5 text-xs text-white disabled:opacity-40"
                  style={{ background: color }}
                >
                  Study ({due})
                </button>
                <button onClick={() => setManagingDeck(deck)} className="btn btn-secondary px-3 py-1.5 text-xs">
                  Manage cards
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function StudySession({
  deck,
  cards,
  prioritizeFrequency,
  onExit,
}: {
  deck: DeckName | 'all'
  cards: Flashcard[]
  prioritizeFrequency: boolean
  onExit: () => void
}) {
  const today = todayIso()
  const queue = useMemo(() => {
    const due = cards.filter((c) => c.dueDate <= today && (deck === 'all' || c.deck === deck))
    if (!prioritizeFrequency) return due
    return [...due].sort((a, b) => {
      const rankA = a.frequencyTier ? FREQUENCY_RANK[a.frequencyTier] : 99
      const rankB = b.frequencyTier ? FREQUENCY_RANK[b.frequencyTier] : 99
      return rankA - rankB
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, deck, today, prioritizeFrequency])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [burst, setBurst] = useState(0)
  const { showToast } = useToast()
  const card = queue[index]
  const color = card ? DECK_COLORS[card.deck] : 'var(--accent)'
  const linkedPattern = useLiveQuery(
    () => (card?.patternId ? db.patterns.get(card.patternId) : undefined),
    [card?.patternId],
  )

  const grade = async (g: ReviewGrade) => {
    if (!card) return
    const update = scheduleReview(card, g)
    await db.flashcards.update(card.id, update)
    await awardXp(g === 'easy' ? 'flashcard_review_easy' : 'flashcard_review', card.id)
    await evaluateBadges()
    setFlipped(false)
    if (index + 1 >= queue.length) {
      setBurst((b) => b + 1)
      showToast('Deck cleared for today!', '🎉')
    }
    setIndex((i) => i + 1)
  }

  if (!card) {
    return (
      <div className="relative space-y-4 text-center">
        <Confetti trigger={burst} />
        <p className="text-2xl">🎉</p>
        <p className="text-lg font-bold">Nice work — all caught up!</p>
        <button onClick={onExit} className="btn btn-primary px-4 py-2 text-sm">
          Back to decks
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-muted)]">
        <button onClick={onExit}>← Exit</button>
        <span>{index + 1} / {queue.length}</span>
      </div>

      <div style={{ perspective: 1200 }} className="min-h-64">
        <motion.button
          onClick={() => setFlipped((f) => !f)}
          className="relative h-64 w-full text-center"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div
            className="card absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
            style={{ backfaceVisibility: 'hidden', borderTop: `6px solid ${color}` }}
          >
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
              {card.deck} · {card.level}
            </span>
            <span className="text-2xl font-black">{card.front}</span>
            <span className="text-xs text-[var(--text-muted)]">Tap to reveal</span>
          </div>
          <div
            className="card absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-y-auto p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderTop: `6px solid ${color}` }}
          >
            <p className="text-lg font-bold">{card.back}</p>
            {card.example && <p className="text-sm italic text-[var(--text-muted)]">"{card.example}"</p>}
            {card.audioNote && <p className="text-xs text-[var(--text-muted)]">🔊 {card.audioNote}</p>}
            {card.collocations && card.collocations.length > 0 && (
              <div className="max-w-full space-y-1 text-center">
                <p className="meta-label">Commonly used with</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {card.collocations.map((phrase) => (
                    <span key={phrase} className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--surface-alt)', color: 'var(--text-muted)' }}>
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {linkedPattern && (
              <div className="mt-1 rounded-xl p-2 text-xs" style={{ background: 'var(--purple-soft)' }}>
                <span className="font-bold" style={{ color: 'var(--purple)' }}>Why this works: </span>
                {linkedPattern.ruleExplanation}
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => grade('again')} className="btn py-2 text-xs text-white" style={{ background: '#ef4444' }}>Again</button>
          <button onClick={() => grade('hard')} className="btn py-2 text-xs text-white" style={{ background: 'var(--orange)' }}>Hard</button>
          <button onClick={() => grade('good')} className="btn py-2 text-xs text-white" style={{ background: 'var(--accent)' }}>Good</button>
          <button onClick={() => grade('easy')} className="btn py-2 text-xs text-white" style={{ background: 'var(--blue)' }}>Easy</button>
        </div>
      )}
    </div>
  )
}

function ManageDeck({
  deck,
  cards,
  onBack,
}: {
  deck: DeckName
  cards: Flashcard[]
  onBack: () => void
}) {
  const [editing, setEditing] = useState<Flashcard | 'new' | null>(null)
  const [tierFilter, setTierFilter] = useState<FrequencyTier | 'all'>('all')
  const color = DECK_COLORS[deck]

  const remove = async (id: string) => {
    await db.flashcards.delete(id)
  }

  if (editing) {
    return (
      <CardForm
        deck={deck}
        card={editing === 'new' ? null : editing}
        onDone={() => setEditing(null)}
      />
    )
  }

  const visibleCards = tierFilter === 'all' ? cards : cards.filter((c) => c.frequencyTier === tierFilter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm font-semibold text-[var(--text-muted)]">← All decks</button>
        <button onClick={() => setEditing('new')} className="btn px-3 py-1.5 text-xs text-white" style={{ background: color }}>
          <Plus size={14} /> New card
        </button>
      </div>
      <h1 className="page-title" style={{ color }}>{deck}</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTierFilter('all')}
          className="rounded-full px-2.5 py-1 text-xs font-bold"
          style={tierFilter === 'all' ? { background: color, color: 'white' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
        >
          All
        </button>
        {FREQUENCY_TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier)}
            className="rounded-full px-2.5 py-1 text-xs font-bold"
            style={tierFilter === tier ? { background: color, color: 'white' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
          >
            {FREQUENCY_TIER_LABELS[tier]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visibleCards.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-3">
            <div>
              <p className="font-bold">{c.front}</p>
              <p className="text-sm text-[var(--text-muted)]">{c.back}</p>
              {c.frequencyTier && <p className="meta-label mt-1">{FREQUENCY_TIER_LABELS[c.frequencyTier]}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <Pencil size={16} />
              </button>
              <button onClick={() => remove(c.id)} className="text-[var(--text-muted)] hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {visibleCards.length === 0 && <p className="text-sm text-[var(--text-muted)]">No cards match this filter.</p>}
      </div>
    </div>
  )
}

function CardForm({
  deck,
  card,
  onDone,
}: {
  deck: DeckName
  card: Flashcard | null
  onDone: () => void
}) {
  const [front, setFront] = useState(card?.front ?? '')
  const [back, setBack] = useState(card?.back ?? '')
  const [example, setExample] = useState(card?.example ?? '')
  const [audioNote, setAudioNote] = useState(card?.audioNote ?? '')
  const [level, setLevel] = useState<CefrLevel>(card?.level ?? 'A1')
  const [tags, setTags] = useState(card?.tags.join(', ') ?? '')
  const [frequencyTier, setFrequencyTier] = useState<FrequencyTier | ''>(card?.frequencyTier ?? '')
  const [collocations, setCollocations] = useState(card?.collocations?.join(', ') ?? '')
  const color = DECK_COLORS[deck]

  const save = async () => {
    if (!front.trim() || !back.trim()) return
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
    const collocationList = collocations.split(',').map((t) => t.trim()).filter(Boolean)
    const patch = {
      front,
      back,
      example,
      audioNote,
      level,
      tags: tagList,
      frequencyTier: frequencyTier || null,
      collocations: collocationList,
    }
    if (card) {
      await db.flashcards.update(card.id, patch)
    } else {
      await db.flashcards.add({
        id: uuid(),
        deck,
        level,
        front: front.trim(),
        back: back.trim(),
        example: example.trim(),
        audioNote: audioNote.trim() || undefined,
        tags: tagList,
        frequencyTier: frequencyTier || null,
        collocations: collocationList,
        createdAt: Date.now(),
        ...newCardScheduleDefaults(),
      })
    }
    onDone()
  }

  return (
    <div className="mx-auto max-w-md space-y-3">
      <button onClick={onDone} className="text-sm font-semibold text-[var(--text-muted)]">← Cancel</button>
      <h1 className="page-title" style={{ color }}>{card ? 'Edit card' : 'New card'} — {deck}</h1>
      <input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front (word / phrase)"
        className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <input
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back (meaning)"
        className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <textarea
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder="Example sentence"
        rows={2}
        className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <input
        value={audioNote}
        onChange={(e) => setAudioNote(e.target.value)}
        placeholder="Pronunciation note (optional)"
        className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as CefrLevel)}
          className="flex-1 rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma-separated"
          className="flex-1 rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={frequencyTier}
          onChange={(e) => setFrequencyTier(e.target.value as FrequencyTier | '')}
          className="flex-1 rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Frequency tier (optional)</option>
          {FREQUENCY_TIERS.map((tier) => (
            <option key={tier} value={tier}>{FREQUENCY_TIER_LABELS[tier]}</option>
          ))}
        </select>
      </div>
      <input
        value={collocations}
        onChange={(e) => setCollocations(e.target.value)}
        placeholder="Collocations, comma-separated (optional)"
        className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <button onClick={save} className="btn btn-primary w-full py-2 text-sm">
        Save card
      </button>
    </div>
  )
}
