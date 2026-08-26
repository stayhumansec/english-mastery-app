import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef } from 'react'
import { db } from '../../lib/db'
import { todayIso } from '../../lib/date'
import { fireNotification } from '../../lib/notifications'

/** Polls once a minute while the app is open and fires a browser notification
 * for any scheduled reminder time, plus an end-of-day nudge if nothing has
 * been logged yet. This only works while a tab/PWA window is open — see the
 * README for background-notification limitations (especially on iOS Safari). */
export function useReminders() {
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!settings) return

    const check = async () => {
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const today = todayIso()

      if (settings.remindersEnabled) {
        for (const time of settings.reminderTimes) {
          const key = `${today}-${time}`
          if (time === hhmm && !firedRef.current.has(key)) {
            firedRef.current.add(key)
            fireNotification('Study time', `Scheduled reminder: ${time}`)
          }
        }
      }

      if (settings.inactivityReminderEnabled && hhmm === settings.inactivityReminderTime) {
        const key = `${today}-inactivity`
        if (!firedRef.current.has(key)) {
          const [timerCount, flashcardReviewed, accentCount] = await Promise.all([
            db.timerLogs.where('date').equals(today).count(),
            db.flashcards.filter((c) => !!c.lastReviewedAt && new Date(c.lastReviewedAt).toDateString() === now.toDateString()).count(),
            db.accentLogs.where('date').equals(today).count(),
          ])
          firedRef.current.add(key)
          if (timerCount === 0 && flashcardReviewed === 0 && accentCount === 0) {
            fireNotification('No study logged yet today', "You haven't logged any study activity today — even 10 minutes counts!")
          }
        }
      }
    }

    check()
    const id = window.setInterval(check, 30_000)
    return () => window.clearInterval(id)
  }, [settings])
}
