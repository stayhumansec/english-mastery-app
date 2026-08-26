import { motion, useReducedMotion } from 'framer-motion'

export default function ProgressBar({
  value,
  label,
  color = 'var(--accent)',
  thick = false,
  gradient = false,
}: {
  value: number
  label?: string
  color?: string
  thick?: boolean
  /** Render the fill as a vibrant two-color gradient (with a glossy top
   * highlight) instead of a flat color — for "hero" game-style bars. */
  gradient?: boolean
}) {
  const pct = Math.max(0, Math.min(100, value))
  const prefersReduced = useReducedMotion()

  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--text-muted)]">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={`relative w-full overflow-hidden rounded-full bg-[var(--border)] ${thick ? 'h-5' : 'h-2.5'}`}
      >
        <motion.div
          className="relative h-full rounded-full"
          style={
            gradient
              ? { backgroundImage: `linear-gradient(90deg, var(--blue), var(--purple), var(--pink))` }
              : { background: color }
          }
          // Always animate in from empty so the fill visibly sweeps in on
          // mount, not just on later value changes.
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { type: 'spring', stiffness: 170, damping: 15 }
          }
        >
          {thick && <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-white/25" />}
        </motion.div>
      </div>
    </div>
  )
}
