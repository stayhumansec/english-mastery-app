import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import { evaluateBadges, type BadgeStatus } from '../../lib/badges'
import { BADGE_CATEGORIES, BADGE_CATEGORY_LABELS } from '../../lib/badgeDefinitions'
import { FEATURE_COLORS, type BadgeCategory } from '../../lib/types'
import { fadeUpItem, staggerContainer } from '../../lib/motionPresets'

export default function AchievementsPage() {
  // Re-run whenever badgeUnlocks changes so newly-unlocked badges (from
  // evaluateBadges() calls elsewhere in the app) refresh live here too.
  useLiveQuery(() => db.badgeUnlocks.toArray(), [])
  const [statuses, setStatuses] = useState<BadgeStatus[] | null>(null)
  const [category, setCategory] = useState<BadgeCategory | 'all'>('all')
  const color = FEATURE_COLORS.progress

  useEffect(() => {
    evaluateBadges().then((r) => setStatuses(r.statuses))
  }, [])

  if (!statuses) return <p className="body-text text-[var(--text-muted)]">Loading…</p>

  const visible = category === 'all' ? statuses : statuses.filter((s) => s.def.category === category)
  const unlockedCount = statuses.filter((s) => s.unlocked).length

  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="show">
      <motion.p variants={fadeUpItem} className="body-text text-[var(--text-muted)]">
        {unlockedCount} / {statuses.length} badges unlocked
      </motion.p>

      <motion.div variants={fadeUpItem} className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={category === 'all' ? { background: color, color: 'white' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
        >
          All
        </button>
        {BADGE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={category === cat ? { background: color, color: 'white' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
          >
            {BADGE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUpItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ def, progressValue, unlocked, unlockedAt }) => {
          const Icon = def.icon
          return (
            <div
              key={def.id}
              className="card flex items-start gap-3 p-3"
              style={unlocked ? { borderLeft: `6px solid ${color}` } : { opacity: 0.55 }}
            >
              <div
                className="icon-badge shrink-0"
                style={{ width: 40, height: 40, background: unlocked ? color : 'var(--border)' }}
              >
                <Icon size={20} color={unlocked ? 'white' : 'var(--text-muted)'} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="section-header text-sm">{def.name}</p>
                <p className="body-text text-xs text-[var(--text-muted)]">{def.description}</p>
                {unlocked ? (
                  <p className="meta-label mt-1" style={{ color }}>
                    Unlocked {unlockedAt ? new Date(unlockedAt).toLocaleDateString() : ''}
                  </p>
                ) : (
                  <p className="meta-label mt-1">{Math.min(progressValue, def.target)}/{def.target}</p>
                )}
              </div>
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
