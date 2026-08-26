import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import { newCardScheduleDefaults } from '../../lib/sm2'
import { startOfWeekIso, todayIso } from '../../lib/date'
import { computeWeeklyStreak } from '../../lib/streak'
import { DECKS, type CefrLevel, type DeckName, type InputDifficulty, type InputLogItem, type InputType } from '../../lib/types'
import { CEFR_LEVELS } from '../../lib/types'
import { Plus, Trash2 } from 'lucide-react'

const TYPE_LABEL: Record<InputType, string> = {
  article: 'Article',
  podcast: 'Podcast',
  video: 'Video',
  book: 'Book',
}

const DIFFICULTY_LABEL: Record<InputDifficulty, string> = {
  easy: 'Easy',
  comfortable: 'Comfortable',
  challenging: 'Challenging',
}

export default function InputLogPage() {
  const entries = useLiveQuery(() => db.inputLogs.orderBy('date').reverse().toArray(), [])

  const [date, setDate] = useState(todayIso())
  const [title, setTitle] = useState('')
  const [type, setType] = useState<InputType>('article')
  const [difficulty, setDifficulty] = useState<InputDifficulty>('comfortable')
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [items, setItems] = useState<InputLogItem[]>([{ text: '', note: '' }])

  const stats = useMemo(() => {
    if (!entries) return { weekMinutes: 0, streak: 0 }
    const thisWeekStart = startOfWeekIso(todayIso())
    const minutesByWeek = new Map<string, number>()
    for (const e of entries) {
      const wk = startOfWeekIso(e.date)
      minutesByWeek.set(wk, (minutesByWeek.get(wk) ?? 0) + e.durationMinutes)
    }
    const activeWeeks = new Set([...minutesByWeek.entries()].filter(([, m]) => m > 0).map(([wk]) => wk))
    return {
      weekMinutes: minutesByWeek.get(thisWeekStart) ?? 0,
      streak: computeWeeklyStreak(activeWeeks),
    }
  }, [entries])

  const updateItem = (i: number, patch: Partial<InputLogItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  const addItemRow = () => setItems((prev) => [...prev, { text: '', note: '' }])
  const removeItemRow = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const submit = async () => {
    if (!title.trim()) return
    await db.inputLogs.add({
      id: uuid(),
      date,
      title: title.trim(),
      type,
      difficulty,
      durationMinutes,
      items: items.filter((it) => it.text.trim()).map((it) => ({ text: it.text.trim(), note: it.note?.trim() || undefined })),
      createdAt: Date.now(),
    })
    setTitle('')
    setDurationMinutes(15)
    setItems([{ text: '', note: '' }])
  }

  const remove = (id: string) => db.inputLogs.delete(id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Comprehensible Input Log</h1>
        <p className="text-sm text-[var(--text-muted)]">Reading & listening, slightly above your level.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-4 text-center">
          <p className="text-3xl font-semibold text-[var(--accent)]">{stats.weekMinutes}</p>
          <p className="text-xs text-[var(--text-muted)]">minutes this week</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-semibold text-[var(--accent)]">{stats.streak}</p>
          <p className="text-xs text-[var(--text-muted)]">week streak</p>
        </div>
      </div>

      <section className="card mx-auto max-w-lg space-y-3 p-4">
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InputType)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          >
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title / source, e.g. 'The Daily podcast — episode on...'"
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as InputDifficulty)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          >
            {Object.entries(DIFFICULTY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            Minutes
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm"
            />
          </label>
        </div>

        <div>
          <p className="mb-1 text-xs text-[var(--text-muted)]">2-3 new words/phrases you picked up</p>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it.text}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  placeholder="word or phrase"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm"
                />
                <input
                  value={it.note ?? ''}
                  onChange={(e) => updateItem(i, { note: e.target.value })}
                  placeholder="meaning (optional)"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm"
                />
                <button onClick={() => removeItemRow(i)} className="text-[var(--text-muted)] hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addItemRow} className="mt-2 flex items-center gap-1 text-xs text-[var(--accent)]">
            <Plus size={14} /> Add another
          </button>
        </div>

        <button onClick={submit} className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
          Log input session
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">History</h2>
        {entries?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No entries yet.</p>}
        {entries?.map((entry) => (
          <div key={entry.id} className="card space-y-2 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{entry.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {entry.date} · {TYPE_LABEL[entry.type]} · {DIFFICULTY_LABEL[entry.difficulty]} · {entry.durationMinutes} min
                </p>
              </div>
              <button onClick={() => remove(entry.id)} className="text-[var(--text-muted)] hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            {entry.items.length > 0 && (
              <div className="space-y-1">
                {entry.items.map((item, i) => (
                  <InputItemRow key={i} entryId={entry.id} index={i} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

function InputItemRow({ entryId, index, item }: { entryId: string; index: number; item: InputLogItem }) {
  const [picking, setPicking] = useState(false)
  const [deck, setDeck] = useState<DeckName>('Everyday Vocabulary')
  const [level, setLevel] = useState<CefrLevel>('B1')

  const sendToFlashcard = async () => {
    const cardId = uuid()
    await db.flashcards.add({
      id: cardId,
      deck,
      level,
      front: item.text,
      back: item.note || '',
      example: '',
      tags: ['from-input-log'],
      createdAt: Date.now(),
      ...newCardScheduleDefaults(),
    })
    const entry = await db.inputLogs.get(entryId)
    if (!entry) return
    const nextItems = entry.items.map((it, i) => (i === index ? { ...it, sentToFlashcardId: cardId } : it))
    await db.inputLogs.update(entryId, { items: nextItems })
    setPicking(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm">
      <span className="font-medium">{item.text}</span>
      {item.note && <span className="text-[var(--text-muted)]">— {item.note}</span>}
      <div className="ml-auto flex items-center gap-2">
        {item.sentToFlashcardId ? (
          <span className="text-xs text-[var(--text-muted)]">✓ in flashcards</span>
        ) : picking ? (
          <>
            <select value={deck} onChange={(e) => setDeck(e.target.value as DeckName)} className="rounded border border-[var(--border)] bg-transparent px-1 py-0.5 text-xs">
              {DECKS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value as CefrLevel)} className="rounded border border-[var(--border)] bg-transparent px-1 py-0.5 text-xs">
              {CEFR_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button onClick={sendToFlashcard} className="rounded bg-[var(--accent)] px-2 py-0.5 text-xs text-white">Add</button>
          </>
        ) : (
          <button onClick={() => setPicking(true)} className="text-xs text-[var(--accent)] hover:underline">
            Send to flashcards
          </button>
        )}
      </div>
    </div>
  )
}
