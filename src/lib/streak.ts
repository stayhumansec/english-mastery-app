import { addDaysIso, todayIso } from './date'

/** Given a set of ISO dates with any recorded activity, compute the current
 * consecutive-day streak ending today or yesterday (a day not yet logged
 * doesn't break the streak until it's over). */
export function computeStreak(activeDates: Set<string>): number {
  let streak = 0
  let cursor = todayIso()

  if (!activeDates.has(cursor)) {
    cursor = addDaysIso(cursor, -1)
    if (!activeDates.has(cursor)) return 0
  }

  while (activeDates.has(cursor)) {
    streak += 1
    cursor = addDaysIso(cursor, -1)
  }

  return streak
}
