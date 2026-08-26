import type { Flashcard, ReviewGrade } from './types'
import { addDaysIso, todayIso } from './date'

// Simple SM-2 spaced-repetition scheduler.
// Grades map to the classic 0-5 quality scale: again=1 (fail), hard=3, good=4, easy=5.
const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
}

export function scheduleReview(
  card: Pick<Flashcard, 'repetitions' | 'easeFactor' | 'intervalDays'>,
  grade: ReviewGrade,
): Pick<Flashcard, 'repetitions' | 'easeFactor' | 'intervalDays' | 'dueDate' | 'lastReviewedAt'> {
  const quality = GRADE_QUALITY[grade]
  let { repetitions, easeFactor, intervalDays } = card

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    repetitions += 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  )

  return {
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    dueDate: addDaysIso(todayIso(), intervalDays),
    lastReviewedAt: Date.now(),
  }
}

export function newCardScheduleDefaults() {
  return {
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    dueDate: todayIso(),
  }
}
