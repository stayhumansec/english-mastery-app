import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { CEFR_LEVELS, SCENARIO_CATEGORIES, type AccentLog, type CefrLevel, type ScenarioCategory, type ScenarioPrompt } from '../../lib/types'
import { Play, Square, Trash2 } from 'lucide-react'

const CATEGORY_LABEL: Record<ScenarioCategory, string> = {
  everyday: 'Everyday',
  professional: 'Professional',
  storytelling: 'Storytelling',
  debate: 'Debate / opinion',
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function AccentPage() {
  const logs = useLiveQuery(() => db.accentLogs.orderBy('createdAt').reverse().toArray(), [])
  const prompts = useLiveQuery(() => db.scenarioPrompts.toArray(), [])

  const [level, setLevel] = useState<CefrLevel>('B1')
  const [currentPrompt, setCurrentPrompt] = useState<ScenarioPrompt | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const [activity, setActivity] = useState('')
  const [rating, setRating] = useState<AccentLog['rating']>(3)
  const [notes, setNotes] = useState('')

  useEffect(() => () => { if (intervalRef.current) window.clearInterval(intervalRef.current) }, [])

  const getPrompt = () => {
    if (!prompts || prompts.length === 0) return
    const pool = prompts.filter((p) => p.level === level)
    const source = pool.length > 0 ? pool : prompts
    const prompt = source[Math.floor(Math.random() * source.length)]
    setCurrentPrompt(prompt)
    setActivity(prompt.prompt)
    setSeconds(0)
    setRunning(false)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
  }

  const toggleTimer = () => {
    if (running) {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
      setRunning(true)
    }
  }

  const submit = async () => {
    if (!activity.trim()) return
    await db.accentLogs.add({
      id: uuid(),
      date: todayIso(),
      activity: activity.trim(),
      rating,
      notes: notes.trim(),
      scenarioPromptId: currentPrompt?.id,
      scenarioCategory: currentPrompt?.category,
      durationSeconds: seconds > 0 ? seconds : undefined,
      createdAt: Date.now(),
    })
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    setActivity('')
    setNotes('')
    setRating(3)
    setCurrentPrompt(null)
    setSeconds(0)
    setRunning(false)
  }

  const remove = (id: string) => db.accentLogs.delete(id)

  const coverage = SCENARIO_CATEGORIES.map((cat) => ({
    category: cat,
    count: logs?.filter((l) => l.scenarioCategory === cat).length ?? 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Speaking & Accent Log</h1>

      <section className="card space-y-2 p-4">
        <h2 className="text-sm font-medium text-[var(--text-muted)]">Category coverage</h2>
        <div className="flex flex-wrap gap-3">
          {coverage.map((c) => (
            <span key={c.category} className={`rounded-full px-3 py-1 text-xs ${c.count === 0 ? 'bg-red-100 text-red-600' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
              {CATEGORY_LABEL[c.category]}: {c.count}
            </span>
          ))}
        </div>
      </section>

      <section className="card mx-auto max-w-md space-y-3 p-4">
        <div className="flex gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CefrLevel)}
            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-sm"
          >
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button onClick={getPrompt} className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
            Get a scenario prompt
          </button>
        </div>

        {currentPrompt && (
          <div className="rounded-lg bg-[var(--accent-soft)] p-3 text-sm">
            <span className="text-xs uppercase tracking-wide text-[var(--accent)]">{CATEGORY_LABEL[currentPrompt.category]} · {currentPrompt.level}</span>
            <p className="mt-1">{currentPrompt.prompt}</p>
          </div>
        )}

        {currentPrompt && (
          <div className="flex items-center justify-center gap-3 rounded-lg border border-[var(--border)] py-3">
            <span className="tabular-nums text-lg font-semibold">{formatSeconds(seconds)}</span>
            <button onClick={toggleTimer} className="rounded-lg bg-[var(--accent)] p-2 text-white">
              {running ? <Square size={16} /> : <Play size={16} />}
            </button>
            <span className="text-xs text-[var(--text-muted)]">record yourself out loud — nothing is saved, just the time</span>
          </div>
        )}

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
              <p className="text-xs text-[var(--text-muted)]">
                {log.date}
                {log.scenarioCategory && ` · ${CATEGORY_LABEL[log.scenarioCategory]}`}
                {log.durationSeconds ? ` · ${formatSeconds(log.durationSeconds)}` : ''}
              </p>
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
