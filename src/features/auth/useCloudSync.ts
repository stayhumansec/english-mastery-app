import { useEffect } from 'react'
import type { User } from 'firebase/auth'
import { saveBackupToCloud } from '../../lib/cloudBackup'

const AUTO_SAVE_INTERVAL_MS = 3 * 60 * 1000

/** Snapshot-based cloud sync: periodically, and when the tab is hidden
 * (best-effort — not guaranteed on every platform, but catches most real
 * exits), save the whole local DB to this user's cloud backup doc so
 * their progress follows them to the next device/browser they sign into. */
export function useCloudSync(user: User | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !user) return
    const uid = user.uid

    const save = () => {
      saveBackupToCloud(uid).catch(() => {})
    }

    const interval = window.setInterval(save, AUTO_SAVE_INTERVAL_MS)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') save()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [user, enabled])
}
