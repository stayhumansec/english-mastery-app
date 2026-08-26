import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { motion } from 'framer-motion'

export default function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const prefersReduced = useReducedMotion()
  const motionValue = useMotionValue(value)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())
  const prevValue = useRef(value)

  useEffect(() => {
    if (prefersReduced) {
      motionValue.set(value)
      prevValue.current = value
      return
    }
    const controls = animate(prevValue.current, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => motionValue.set(v),
    })
    prevValue.current = value
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <motion.span className={className}>{rounded}</motion.span>
}
