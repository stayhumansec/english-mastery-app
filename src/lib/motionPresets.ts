import type { Transition } from 'framer-motion'

/** Springy, elastic-feeling transition for buttons, celebrations, and
 * anything that should feel bouncy rather than robotic. */
export const bouncy: Transition = { type: 'spring', stiffness: 380, damping: 18 }

/** Slightly softer spring for progress bars and larger surfaces, where a
 * big overshoot would feel exaggerated. */
export const gentleSpring: Transition = { type: 'spring', stiffness: 220, damping: 20 }

/** Standard ease-out for entrances (150-300ms per the design spec). */
export const easeOut: Transition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] }

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: easeOut },
}
