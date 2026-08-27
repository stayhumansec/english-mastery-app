import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Sparkles, Timer as TimerIcon, Puzzle } from 'lucide-react'
import { FEATURE_COLORS } from '../../lib/types'
import { fadeUpItem, staggerContainer } from '../../lib/motionPresets'
import FlashcardsPage from '../flashcards/FlashcardsPage'
import DrillsPage from '../drills/DrillsPage'
import PatternsPage from '../patterns/PatternsPage'
import TimerPage from '../timer/TimerPage'

type PracticeTab = 'flashcards' | 'drills' | 'patterns' | 'timer'

const TABS: Array<{ key: PracticeTab; label: string; icon: typeof Layers }> = [
  { key: 'flashcards', label: 'Flashcards', icon: Layers },
  { key: 'drills', label: 'Drills', icon: Sparkles },
  { key: 'patterns', label: 'Patterns', icon: Puzzle },
  { key: 'timer', label: 'Timer', icon: TimerIcon },
]

/** Merges Flashcards, Drills, Patterns and the study Timer into one hub so a
 * daily practice session doesn't require bouncing between separate
 * top-level sidebar destinations (Part 1 §1). */
export default function PracticeHub() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as PracticeTab | null) ?? 'flashcards'
  const color = FEATURE_COLORS.practice

  const setTab = (next: PracticeTab) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', next)
    if (next !== 'drills') params.delete('patternId')
    setSearchParams(params)
  }

  return (
    <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUpItem}>
        <h1 className="page-title" style={{ color }}>Practice 🎯</h1>
        <p className="body-text text-[var(--text-muted)]">Flashcards, drills, patterns and your study timer — one place for daily practice.</p>
      </motion.div>

      <motion.div variants={fadeUpItem} className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors"
            style={
              tab === key
                ? { background: color, color: 'white' }
                : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }
            }
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUpItem}>
        {tab === 'flashcards' && <FlashcardsPage />}
        {tab === 'drills' && <DrillsPage />}
        {tab === 'patterns' && <PatternsPage />}
        {tab === 'timer' && <TimerPage />}
      </motion.div>
    </motion.div>
  )
}
