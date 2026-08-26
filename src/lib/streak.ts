import { addDaysIso, startOfWeekIso, todayIso } from './date'

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

/** Same idea as computeStreak but for consecutive weeks (keyed by each
 * week's Monday), for activity that's naturally weekly rather than daily
 * (e.g. comprehensible input minutes). */
export function computeWeeklyStreak(activeWeekStarts: Set<string>): number {
  let streak = 0
  let cursor = startOfWeekIso(todayIso())

  if (!activeWeekStarts.has(cursor)) {
    cursor = addDaysIso(cursor, -7)
    if (!activeWeekStarts.has(cursor)) return 0
  }

  while (activeWeekStarts.has(cursor)) {
    streak += 1
    cursor = addDaysIso(cursor, -7)
  }

  return streak
}
