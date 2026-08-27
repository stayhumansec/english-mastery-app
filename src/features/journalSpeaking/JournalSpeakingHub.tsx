import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mic, PenLine } from 'lucide-react'
import { FEATURE_COLORS } from '../../lib/types'
import { fadeUpItem, staggerContainer } from '../../lib/motionPresets'
import JournalPage from '../journal/JournalPage'
import AccentPage from '../accent/AccentPage'
import InputLogPage from '../input/InputLogPage'

type OutputTab = 'journal' | 'speaking' | 'input'

const TABS: Array<{ key: OutputTab; label: string; icon: typeof PenLine }> = [
  { key: 'journal', label: 'Journal', icon: PenLine },
  { key: 'speaking', label: 'Speaking', icon: Mic },
  { key: 'input', label: 'Input Log', icon: BookOpen },
]

/** Merges the Writing Journal, Speaking/Accent Log and Comprehensible Input
 * Log into one "output & input" hub (Part 1 §1). */
export default function JournalSpeakingHub() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as OutputTab | null) ?? 'journal'
  const color = FEATURE_COLORS.journalSpeaking

  const setTab = (next: OutputTab) => setSearchParams({ tab: next })

  return (
    <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUpItem}>
        <h1 className="page-title" style={{ color }}>Journal & Speaking ✍️</h1>
        <p className="body-text text-[var(--text-muted)]">Your output and input practice — writing, speaking, and what you're reading/listening to.</p>
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
        {tab === 'journal' && <JournalPage />}
        {tab === 'speaking' && <AccentPage />}
        {tab === 'input' && <InputLogPage />}
      </motion.div>
    </motion.div>
  )
}
