import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { computeStreak } from '../../lib/streak'
import { Trash2 } from 'lucide-react'

function wordCount(text: string): number {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

export default function JournalPage() {
  const entries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().toArray(), [])
  const patterns = useLiveQuery(() => db.patterns.toArray(), [])

  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [patternId, setPatternId] = useState('')

  const streak = useMemo(() => {
    if (!entries) return 0
    return computeStreak(new Set(entries.map((e) => e.date)))
  }, [entries])

  const todaysEntry = entries?.find((e) => e.date === todayIso())

  const submit = async () => {
    if (!text.trim()) return
    await db.journalEntries.add({
      id: uuid(),
      date: todayIso(),
      text: text.trim(),
      wordCount: wordCount(text),
      tag: tag.trim() || undefined,
      patternId: patternId || undefined,
      createdAt: Date.now(),
    })
    setText('')
    setTag('')
    setPatternId('')
  }

  const remove = (id: string) => db.journalEntries.delete(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Writing Journal</h1>
          <p className="text-sm text-[var(--text-muted)]">Free-write in English. Producing beats recognizing.</p>
        </div>
        <div className="card px-4 py-2 text-center">
          <p className="text-2xl font-semibold text-[var(--accent)]">{streak}</p>
          <p className="text-xs text-[var(--text-muted)]">day streak</p>
        </div>
      </div>

      {!todaysEntry ? (
        <section className="card mx-auto max-w-lg space-y-3 p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your day, an idea, a reflection — anything."
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{wordCount(text)} words</span>
          </div>
          <div className="flex gap-2">
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag: grammar/vocab you tried to use (optional)"
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            />
            <select
              value={patternId}
              onChange={(e) => setPatternId(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Link a pattern (optional)</option>
              {patterns?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button onClick={submit} className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
            Save today's entry
          </button>
        </section>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          You've already written today ({todaysEntry.wordCount} words) — nice work. Come back tomorrow.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="font-medium">Past entries</h2>
        {entries?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No entries yet.</p>}
        {entries?.map((entry) => (
          <div key={entry.id} className="card space-y-1 p-3">
            <div className="flex items-start justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {entry.date} · {entry.wordCount} words
                {entry.tag && ` · tag: ${entry.tag}`}
                {entry.patternId && patterns && ` · pattern: ${patterns.find((p) => p.id === entry.patternId)?.name ?? ''}`}
              </p>
              <button onClick={() => remove(entry.id)} className="text-[var(--text-muted)] hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm">{entry.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
