import { motion } from 'framer-motion'

export type MascotPose = 'neutral' | 'wave' | 'celebrate' | 'sad'

/** A small, reusable blob-character mascot — deliberately simple (a rounded
 * body + face) rather than a complex illustration, so it's cheap to reuse
 * across empty states, celebrations and onboarding while still giving the
 * app a consistent, friendly "face". Color and pose vary; the underlying
 * shape stays the same so it reads as one recurring character. */
export default function Mascot({
  pose = 'neutral',
  size = 72,
  color = 'var(--accent)',
  className = '',
}: {
  pose?: MascotPose
  size?: number
  color?: string
  className?: string
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: pose === 'celebrate' ? [0, -6, 0] : 0 }}
      transition={
        pose === 'celebrate'
          ? { duration: 0.9, repeat: 1, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 260, damping: 20 }
      }
    >
      {/* body */}
      <path
        d="M50 6c24 0 42 18 42 42 0 22-16 40-42 40S8 70 8 48C8 24 26 6 50 6Z"
        fill={color}
      />
      {/* rosy cheeks */}
      <circle cx={30} cy={58} r={6} fill="white" opacity={0.25} />
      <circle cx={70} cy={58} r={6} fill="white" opacity={0.25} />

      {pose === 'sad' ? (
        <>
          <circle cx={36} cy={46} r={5} fill="white" />
          <circle cx={64} cy={46} r={5} fill="white" />
          <path d="M36 68q14-10 28 0" stroke="white" strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      ) : pose === 'celebrate' ? (
        <>
          <path d="M30 44q6-8 12 0" stroke="white" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M58 44q6-8 12 0" stroke="white" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M34 58q16 14 32 0" stroke="white" strokeWidth={5} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx={36} cy={46} r={5} fill="white" />
          <circle cx={64} cy={46} r={5} fill="white" />
          <path d="M36 60q14 12 28 0" stroke="white" strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      )}

      {pose === 'wave' && (
        <motion.path
          d="M82 42c6-4 12-2 14 4"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 18, 0, 18, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.2 }}
          style={{ transformOrigin: '82px 42px' }}
        />
      )}
    </motion.svg>
  )
}
