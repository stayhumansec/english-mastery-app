import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

const COLORS = ['#22c55e', '#f97316', '#a855f7', '#ec4899', '#3b82f6', '#facc15']
const PARTICLE_COUNT = 14

interface Particle {
  id: number
  angle: number
  distance: number
  color: string
  size: number
}

/** Absolutely-positioned confetti burst. Mount inside a `relative`
 * container and increment `trigger` to fire a new burst (e.g. on
 * completing a module, clearing a deck, or hitting a streak milestone). */
export default function Confetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (trigger === 0 || prefersReduced) return
    const next = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: trigger * 100 + i,
      angle: (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5,
      distance: 50 + Math.random() * 40,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 5,
    }))
    setParticles(next)
    const timeout = window.setTimeout(() => setParticles([]), 700)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
            animate={{
              opacity: 0,
              x: Math.cos(p.angle) * p.distance,
              y: Math.sin(p.angle) * p.distance,
              scale: 1,
            }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
