import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { computeWeeklyRecap, type WeeklyRecapData } from '../../lib/weeklyRecap'
import { FEATURE_COLORS } from '../../lib/types'
import { fadeUpItem, staggerContainer } from '../../lib/motionPresets'
import AnimatedNumber from '../../components/motion/AnimatedNumber'
import Mascot from '../../components/Mascot'

export default function WeeklyRecap() {
  const [data, setData] = useState<WeeklyRecapData | null>(null)
  const color = FEATURE_COLORS.progress

  useEffect(() => {
    computeWeeklyRecap().then(setData)
  }, [])

  if (!data) return <p className="body-text text-[var(--text-muted)]">Loading…</p>

  const stats = [
    { label: 'minutes studied', value: data.studyMinutes },
    { label: 'flashcards reviewed', value: data.flashcardsReviewed },
    { label: 'new words added', value: data.newWords },
    { label: 'words journaled', value: data.journalWords },
    { label: 'XP earned', value: data.xpThisWeek },
  ]

  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div
        variants={fadeUpItem}
        className="blob-decoration card flex items-center gap-3 p-4"
        style={{ background: 'var(--yellow-soft)', ['--blob-color' as string]: color }}
      >
        <div className="blob-content"><Mascot pose="celebrate" size={56} color={color} /></div>
        <div className="blob-content">
          <p className="meta-label" style={{ color }}>This week's highlight</p>
          <p className="section-header">{data.highlight}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUpItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-3">
            <AnimatedNumber value={s.value} className="text-2xl font-black" />
            <p className="meta-label mt-1">{s.label}</p>
          </div>
        ))}
        <div className="card p-3">
          <p className="text-2xl font-black">{data.streak}</p>
          <p className="meta-label mt-1">
            day streak — {data.streakStatus === 'maintained' ? 'maintained ✅' : 'broken this week'}
          </p>
        </div>
      </motion.div>

      {(data.badgesUnlockedThisWeek.length > 0 || data.modulesCompletedThisWeek.length > 0) && (
        <motion.div variants={fadeUpItem} className="card space-y-2 p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color }} />
            <p className="section-header text-sm">This week's wins</p>
          </div>
          {data.badgesUnlockedThisWeek.map((b) => (
            <p key={b} className="body-text text-sm">🏅 Badge unlocked: {b}</p>
          ))}
          {data.modulesCompletedThisWeek.map((m) => (
            <p key={m} className="body-text text-sm">🎓 Module completed: {m}</p>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
