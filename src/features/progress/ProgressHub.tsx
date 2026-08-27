import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, CalendarClock } from 'lucide-react'
import { db } from '../../lib/db'
import { levelProgress } from '../../lib/xpConfig'
import { FEATURE_COLORS } from '../../lib/types'
import { fadeUpItem, staggerContainer } from '../../lib/motionPresets'
import ProgressBar from '../../components/ProgressBar'
import AnimatedNumber from '../../components/motion/AnimatedNumber'
import AchievementsPage from './AchievementsPage'
import WeeklyRecap from './WeeklyRecap'

type ProgressTab = 'achievements' | 'recap'

/** Streaks, XP/level, badges and the weekly recap all live here — the
 * consolidated "Progress" destination (Part 1 §1). */
export default function ProgressHub() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as ProgressTab | null) ?? 'achievements'
  const color = FEATURE_COLORS.progress

  const xpEntries = useLiveQuery(() => db.xpLog.toArray(), [])
  const totalXp = xpEntries?.reduce((s, e) => s + e.xpAwarded, 0) ?? 0
  const level = levelProgress(totalXp)

  const setTab = (next: ProgressTab) => setSearchParams({ tab: next })

  return (
    <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUpItem}>
        <h1 className="page-title" style={{ color }}>Progress 🏆</h1>
      </motion.div>

      <motion.div variants={fadeUpItem} className="card space-y-2 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="meta-label">Level</p>
            <AnimatedNumber value={level.level} className="text-3xl font-black" />
          </div>
          <div className="text-right">
            <p className="meta-label">XP to next level</p>
            <p className="section-header text-sm">
              {level.xpIntoLevel} / {level.xpForNextLevel} XP
            </p>
          </div>
        </div>
        <ProgressBar value={level.pct} color={color} gradient thick />
      </motion.div>

      <motion.div variants={fadeUpItem} className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('achievements')}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors"
          style={tab === 'achievements' ? { background: color, color: 'white' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
        >
          <Award size={14} /> Achievements
        </button>
        <button
          onClick={() => setTab('recap')}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors"
          style={tab === 'recap' ? { background: color, color: 'white' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
        >
          <CalendarClock size={14} /> This Week
        </button>
      </motion.div>

      <motion.div variants={fadeUpItem}>
        {tab === 'achievements' ? <AchievementsPage /> : <WeeklyRecap />}
      </motion.div>
    </motion.div>
  )
}
