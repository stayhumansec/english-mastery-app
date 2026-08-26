import { addDaysIso } from '../../lib/date'
import type { CalendarSession } from '../../lib/types'

export interface Occurrence {
  session: CalendarSession
  date: string // ISO date of this specific occurrence
  completed: boolean
}

function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** Expand a (possibly recurring) session into concrete dated occurrences
 * within [rangeStart, rangeEnd], both ISO dates inclusive. */
export function expandOccurrences(
  session: CalendarSession,
  rangeStart: string,
  rangeEnd: string,
): Occurrence[] {
  const occurrences: Occurrence[] = []
  const seriesEnd = session.recurrenceUntil ?? rangeEnd
  const effectiveEnd = seriesEnd < rangeEnd ? seriesEnd : rangeEnd
  const baseDow = dayOfWeek(session.date)

  let cursor = session.date > rangeStart ? session.date : rangeStart

  // Align weekly recurrence to the correct day-of-week within the range.
  if (session.recurrence === 'weekly' && cursor > session.date) {
    const diff = (dayOfWeek(cursor) - baseDow + 7) % 7
    if (diff !== 0) cursor = addDaysIso(cursor, 7 - diff)
  }

  while (cursor <= effectiveEnd) {
    if (cursor >= session.date) {
      const dow = dayOfWeek(cursor)
      const matches =
        session.recurrence === 'none'
          ? cursor === session.date
          : session.recurrence === 'daily'
            ? true
            : session.recurrence === 'weekdays'
              ? dow >= 1 && dow <= 5
              : session.recurrence === 'weekly'
                ? dow === baseDow
                : false

      if (matches) {
        occurrences.push({
          session,
          date: cursor,
          completed: session.completedDates.includes(cursor),
        })
      }
    }

    if (session.recurrence === 'none') break
    cursor = addDaysIso(cursor, 1)
  }

  return occurrences
}
