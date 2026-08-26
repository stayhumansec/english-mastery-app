import { motion, useReducedMotion } from 'framer-motion'

export default function ProgressBar({
  value,
  label,
  color = 'var(--accent)',
  thick = false,
}: {
  value: number
  label?: string
  color?: string
  thick?: boolean
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
        className={`w-full overflow-hidden rounded-full bg-[var(--border)] ${thick ? 'h-4' : 'h-2.5'}`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { type: 'spring', stiffness: 170, damping: 15 }
          }
        />
      </div>
    </div>
  )
}
