import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { v4 as uuid } from 'uuid'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { db } from '../../lib/db'
import { addDaysIso, toIso, todayIso } from '../../lib/date'
import { expandOccurrences } from './occurrences'
import {
  ACTIVITY_CATEGORIES,
  CATEGORY_COLORS,
  type ActivityCategory,
  type CalendarSession,
  type RecurrenceFreq,
} from '../../lib/types'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales: { 'en-US': enUS },
})

interface FormState {
  id?: string
  title: string
  category: ActivityCategory
  date: string
  startTime: string
  durationMinutes: number
  recurrence: RecurrenceFreq
  notes: string
}

function emptyForm(date: string): FormState {
  return {
    title: '',
    category: 'Grammar',
    date,
    startTime: '07:00',
    durationMinutes: 30,
    recurrence: 'none',
    notes: '',
  }
}

export default function CalendarPage() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [form, setForm] = useState<FormState | null>(null)

  const events = useMemo(() => {
    if (!sessions) return []
    const rangeStart = addDaysIso(toIso(date), -45)
    const rangeEnd = addDaysIso(toIso(date), 90)
    return sessions.flatMap((session) =>
      expandOccurrences(session, rangeStart, rangeEnd).map((occ) => {
        const [h, m] = session.startTime.split(':').map(Number)
        const [y, mo, d] = occ.date.split('-').map(Number)
        const start = new Date(y, mo - 1, d, h, m)
        const end = new Date(start.getTime() + session.durationMinutes * 60000)
        return {
          id: `${session.id}|${occ.date}`,
          title: session.title,
          start,
          end,
          resource: { session, date: occ.date, completed: occ.completed },
        }
      }),
    )
  }, [sessions, date])

  const openNew = (isoDate: string) => setForm(emptyForm(isoDate))

  const openEdit = (session: CalendarSession) =>
    setForm({
      id: session.id,
      title: session.title,
      category: session.category,
      date: session.date,
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      recurrence: session.recurrence,
      notes: session.notes ?? '',
    })

  const toggleComplete = async (session: CalendarSession, occDate: string) => {
    const completed = session.completedDates.includes(occDate)
    const completedDates = completed
      ? session.completedDates.filter((d) => d !== occDate)
      : [...session.completedDates, occDate]
    await db.sessions.update(session.id, { completedDates })
  }

  const save = async () => {
    if (!form || !form.title.trim()) return
    if (form.id) {
      await db.sessions.update(form.id, {
        title: form.title.trim(),
        category: form.category,
        date: form.date,
        startTime: form.startTime,
        durationMinutes: form.durationMinutes,
        recurrence: form.recurrence,
        notes: form.notes,
      })
    } else {
      await db.sessions.add({
        id: uuid(),
        title: form.title.trim(),
        category: form.category,
        date: form.date,
        startTime: form.startTime,
        durationMinutes: form.durationMinutes,
        recurrence: form.recurrence,
        completedDates: [],
        notes: form.notes,
        createdAt: Date.now(),
      })
    }
    setForm(null)
  }

  const remove = async () => {
    if (!form?.id) return
    await db.sessions.delete(form.id)
    setForm(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <button
          onClick={() => openNew(todayIso())}
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
        >
          New session
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {ACTIVITY_CATEGORIES.map((c) => (
          <span key={c} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />
            {c}
          </span>
        ))}
      </div>

      <div style={{ height: 640 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week', 'day']}
          selectable
          onSelectSlot={(slot) => openNew(toIso(slot.start))}
          onSelectEvent={(event: any) => openEdit(event.resource.session)}
          eventPropGetter={(event: any) => ({
            style: {
              backgroundColor: CATEGORY_COLORS[event.resource.session.category as ActivityCategory],
              opacity: event.resource.completed ? 0.45 : 1,
              textDecoration: event.resource.completed ? 'line-through' : 'none',
            },
          })}
        />
      </div>

      {form && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={() => setForm(null)}>
          <div className="card w-full max-w-sm space-y-3 p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-medium">{form.id ? 'Edit session' : 'New session'}</h2>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Vocabulary review"
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ActivityCategory })}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center justify-between text-sm">
              <span>Duration (minutes)</span>
              <input
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-20 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm"
              />
            </label>
            <select
              value={form.recurrence}
              onChange={(e) => setForm({ ...form, recurrence: e.target.value as RecurrenceFreq })}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Every day</option>
              <option value="weekdays">Every weekday</option>
              <option value="weekly">Every week</option>
            </select>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes"
              rows={2}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white">
                Save
              </button>
              {form.id && (
                <button
                  onClick={() => toggleComplete(sessions!.find((s) => s.id === form.id)!, form.date)}
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                >
                  Toggle done
                </button>
              )}
              {form.id && (
                <button onClick={remove} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-red-500">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
