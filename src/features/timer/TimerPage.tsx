import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { fireNotification } from '../../lib/notifications'
import Confetti from '../../components/motion/Confetti'
import { useToast } from '../../components/motion/ToastProvider'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { ACTIVITY_CATEGORIES, CATEGORY_COLORS, FEATURE_COLORS, type ActivityCategory } from '../../lib/types'
import { Pause, Play, RotateCcw } from 'lucide-react'

type Phase = 'idle' | 'running' | 'paused' | 'break'

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v, i) => (i === 0 && v === 0 ? null : String(v).padStart(2, '0'))).filter(Boolean).join(':')
    || '00:00'
}

export default function TimerPage() {
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const { showToast } = useToast()
  const [category, setCategory] = useState<ActivityCategory>('Vocabulary')
  const [label, setLabel] = useState('')
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [burst, setBurst] = useState(0)
  const startedAtRef = useRef<number>(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [])

  const tick = () => {
    setSecondsLeft((s) => {
      if (s <= 1) {
        window.clearInterval(intervalRef.current!)
        intervalRef.current = null
        handleComplete()
        return 0
      }
      return s - 1
    })
  }

  const start = () => {
    const total = hours * 3600 + minutes * 60
    if (total <= 0) return
    setTotalSeconds(total)
    setSecondsLeft(total)
    setPhase('running')
    startedAtRef.current = Date.now()
    intervalRef.current = window.setInterval(tick, 1000)
  }

  const pause = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    setPhase('paused')
  }

  const resume = () => {
    setPhase('running')
    intervalRef.current = window.setInterval(tick, 1000)
  }

  const reset = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    setPhase('idle')
    setSecondsLeft(0)
    setTotalSeconds(0)
  }

  const handleComplete = async () => {
    if (phase !== 'break') {
      const durationMinutes = Math.round((Date.now() - startedAtRef.current) / 60000) || Math.round(totalSeconds / 60)
      await db.timerLogs.add({
        id: uuid(),
        category,
        label: label.trim() || category,
        date: todayIso(),
        startedAt: startedAtRef.current,
        durationMinutes,
        breakMinutes: 0,
        createdAt: Date.now(),
      })
      fireNotification('Session complete', `${label || category} — ${durationMinutes} min logged.`)
      setBurst((b) => b + 1)
      showToast(`${durationMinutes} min logged!`, '⏱️')

      if (settings?.breakEnabled) {
        const breakTotal = settings.breakDurationMinutes * 60
        setTotalSeconds(breakTotal)
        setSecondsLeft(breakTotal)
        setPhase('break')
        intervalRef.current = window.setInterval(tick, 1000)
        return
      }
    } else {
      fireNotification('Break over', 'Ready for another session?')
    }
    setPhase('idle')
  }

  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0
  const timerColor = FEATURE_COLORS.timer

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.h1 variants={fadeUpItem} className="text-2xl font-black" style={{ color: timerColor }}>
        Study Timer ⏱️
      </motion.h1>

      <motion.div variants={fadeUpItem} className="card relative mx-auto max-w-sm space-y-4 p-6 text-center">
        <Confetti trigger={burst} />
        {phase === 'idle' && (
          <div className="space-y-3 text-left">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Session label (optional)"
              className="w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <label className="flex-1 text-xs font-semibold text-[var(--text-muted)]">
                Hours
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="flex-1 text-xs font-semibold text-[var(--text-muted)]">
                Minutes
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                />
              </label>
            </div>
            <button onClick={start} className="btn w-full py-2 text-sm text-white" style={{ background: timerColor }}>
              <Play size={16} /> Start
            </button>
          </div>
        )}

        {phase !== 'idle' && (
          <div className="space-y-4">
            {phase === 'break' && <p className="text-sm font-bold" style={{ color: timerColor }}>Break</p>}
            <div
              className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${timerColor} ${progressPct}%, var(--border) 0)`,
              }}
            >
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[var(--surface)] text-3xl font-black tabular-nums">
                {formatTime(secondsLeft)}
              </div>
            </div>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              {phase === 'break' ? 'Enjoy your break' : label || category}
            </p>
            <div className="flex justify-center gap-3">
              {phase === 'running' && (
                <button onClick={pause} className="btn btn-secondary p-2">
                  <Pause size={18} />
                </button>
              )}
              {phase === 'paused' && (
                <button onClick={resume} className="btn btn-secondary p-2">
                  <Play size={18} />
                </button>
              )}
              <button onClick={reset} className="btn btn-secondary p-2">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div variants={fadeUpItem}>
        <TimerHistory />
      </motion.div>
    </motion.div>
  )
}

function TimerHistory() {
  const [dateFilter, setDateFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | 'all'>('all')

  const logs = useLiveQuery(
    () => db.timerLogs.orderBy('createdAt').reverse().toArray(),
    [],
  )

  if (!logs) return null

  const filtered = logs.filter(
    (l) => (!dateFilter || l.date === dateFilter) && (categoryFilter === 'all' || l.category === categoryFilter),
  )

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Session history</h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-xs"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ActivityCategory | 'all')}
            className="rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-xs"
          >
            <option value="all">All categories</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {filtered.length === 0 && <p className="text-sm text-[var(--text-muted)]">⏳ No sessions logged yet — start the timer above!</p>}
        {filtered.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl border-2 border-[var(--border)] px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[l.category] }} />
              {l.label}
            </span>
            <span className="font-semibold text-[var(--text-muted)]">{l.date} · {l.durationMinutes} min</span>
          </div>
        ))}
      </div>
    </section>
  )
}
