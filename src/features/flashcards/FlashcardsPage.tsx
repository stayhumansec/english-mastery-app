import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { newCardScheduleDefaults, scheduleReview } from '../../lib/sm2'
import { CEFR_LEVELS, DECKS, type CefrLevel, type DeckName, type Flashcard, type ReviewGrade } from '../../lib/types'
import { Pencil, Plus, Trash2 } from 'lucide-react'

export default function FlashcardsPage() {
  const cards = useLiveQuery(() => db.flashcards.toArray(), [])
  const [studyDeck, setStudyDeck] = useState<DeckName | 'all' | null>(null)
  const [managingDeck, setManagingDeck] = useState<DeckName | null>(null)

  if (!cards) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  if (studyDeck) {
    return <StudySession deck={studyDeck} cards={cards} onExit={() => setStudyDeck(null)} />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Flashcards</h1>
          <p className="text-sm text-[var(--text-muted)]">{dueTotal} card(s) due today across all decks</p>
        </div>
        {dueTotal > 0 && (
          <button
            onClick={() => setStudyDeck('all')}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Study all due
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DECKS.map((deck) => {
          const deckCards = cards.filter((c) => c.deck === deck)
          const due = deckCards.filter((c) => c.dueDate <= today).length
          const mastered = deckCards.filter((c) => c.repetitions >= 4).length
          return (
            <div key={deck} className="card space-y-2 p-4">
              <h2 className="font-medium">{deck}</h2>
              <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                <span>{deckCards.length} total</span>
                <span>{due} due</span>
                <span>{mastered} mastered</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  disabled={due === 0}
                  onClick={() => setStudyDeck(deck)}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                >
                  Study ({due})
                </button>
                <button
                  onClick={() => setManagingDeck(deck)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs"
                >
                  Manage cards
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StudySession({
  deck,
  cards,
  onExit,
}: {
  deck: DeckName | 'all'
  cards: Flashcard[]
  onExit: () => void
}) {
  const today = todayIso()
  const queue = useMemo(
    () => cards.filter((c) => c.dueDate <= today && (deck === 'all' || c.deck === deck)),
    [cards, deck, today],
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = queue[index]

  const grade = async (g: ReviewGrade) => {
    if (!card) return
    const update = scheduleReview(card, g)
    await db.flashcards.update(card.id, update)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  if (!card) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-medium">Nice work — all caught up!</p>
        <button onClick={onExit} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white">
          Back to decks
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <button onClick={onExit}>← Exit</button>
        <span>{index + 1} / {queue.length}</span>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="card flex min-h-56 w-full flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{card.deck} · {card.level}</span>
        <span className="text-2xl font-semibold">{card.front}</span>
        {flipped && (
          <div className="mt-2 space-y-2 border-t border-[var(--border)] pt-3">
            <p className="font-medium">{card.back}</p>
            {card.example && <p className="text-sm italic text-[var(--text-muted)]">"{card.example}"</p>}
            {card.audioNote && <p className="text-xs text-[var(--text-muted)]">🔊 {card.audioNote}</p>}
          </div>
        )}
        {!flipped && <span className="text-xs text-[var(--text-muted)]">Tap to reveal</span>}
      </button>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => grade('again')} className="rounded-lg bg-red-500 py-2 text-xs font-medium text-white">Again</button>
          <button onClick={() => grade('hard')} className="rounded-lg bg-orange-500 py-2 text-xs font-medium text-white">Hard</button>
          <button onClick={() => grade('good')} className="rounded-lg bg-emerald-500 py-2 text-xs font-medium text-white">Good</button>
          <button onClick={() => grade('easy')} className="rounded-lg bg-blue-500 py-2 text-xs font-medium text-white">Easy</button>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-[var(--text-muted)]">← All decks</button>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
        >
          <Plus size={14} /> New card
        </button>
      </div>
      <h1 className="text-xl font-semibold">{deck}</h1>
      <div className="space-y-2">
        {cards.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{c.front}</p>
              <p className="text-sm text-[var(--text-muted)]">{c.back}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="text-[var(--text-muted)] hover:text-[var(--accent)]">
                <Pencil size={16} />
              </button>
              <button onClick={() => remove(c.id)} className="text-[var(--text-muted)] hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm text-[var(--text-muted)]">No cards yet in this deck.</p>}
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

  const save = async () => {
    if (!front.trim() || !back.trim()) return
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (card) {
      await db.flashcards.update(card.id, { front, back, example, audioNote, level, tags: tagList })
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
        createdAt: Date.now(),
        ...newCardScheduleDefaults(),
      })
    }
    onDone()
  }

  return (
    <div className="mx-auto max-w-md space-y-3">
      <button onClick={onDone} className="text-sm text-[var(--text-muted)]">← Cancel</button>
      <h1 className="text-xl font-semibold">{card ? 'Edit card' : 'New card'} — {deck}</h1>
      <input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front (word / phrase)"
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <input
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back (meaning)"
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <textarea
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder="Example sentence"
        rows={2}
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <input
        value={audioNote}
        onChange={(e) => setAudioNote(e.target.value)}
        placeholder="Pronunciation note (optional)"
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as CefrLevel)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma-separated"
          className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <button onClick={save} className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
        Save card
      </button>
    </div>
  )
}
