import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import type { AccentLog } from '../../lib/types'
import { Trash2 } from 'lucide-react'

export default function AccentPage() {
  const logs = useLiveQuery(() => db.accentLogs.orderBy('createdAt').reverse().toArray(), [])
  const [date, setDate] = useState(todayIso())
  const [activity, setActivity] = useState('')
  const [rating, setRating] = useState<AccentLog['rating']>(3)
  const [notes, setNotes] = useState('')

  const submit = async () => {
    if (!activity.trim()) return
    await db.accentLogs.add({
      id: uuid(),
      date,
      activity: activity.trim(),
      rating,
      notes: notes.trim(),
      createdAt: Date.now(),
    })
    setActivity('')
    setNotes('')
    setRating(3)
  }

  const remove = (id: string) => db.accentLogs.delete(id)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Accent & Pronunciation Log</h1>

      <section className="card mx-auto max-w-md space-y-3 p-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
        <input
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="What did you shadow/practice? e.g. Rachel's English — vowel sounds"
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex items-center justify-between text-sm">
          <span>Self-rating</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n as AccentLog['rating'])}
                className={`h-8 w-8 rounded-full text-sm ${
                  rating === n ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (what went well, what to fix next time)"
          rows={2}
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={submit} className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
          Log practice
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">History</h2>
        {logs?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No entries yet.</p>}
        {logs?.map((log) => (
          <div key={log.id} className="card flex items-start justify-between gap-3 p-3">
            <div>
              <p className="text-sm font-medium">
                {log.activity} <span className="text-[var(--text-muted)]">· {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)]">{log.date}</p>
              {log.notes && <p className="mt-1 text-sm">{log.notes}</p>}
            </div>
            <button onClick={() => remove(log.id)} className="text-[var(--text-muted)] hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
