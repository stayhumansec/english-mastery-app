import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from './routes/Layout'
import Dashboard from './features/dashboard/Dashboard'
import Roadmap from './features/roadmap/Roadmap'
import CalendarPage from './features/calendar/CalendarPage'
import SettingsPage from './features/settings/SettingsPage'
import PracticeHub from './features/practice/PracticeHub'
import JournalSpeakingHub from './features/journalSpeaking/JournalSpeakingHub'
import ProgressHub from './features/progress/ProgressHub'
import Onboarding from './features/onboarding/Onboarding'
import { useAuth } from './features/auth/AuthProvider'
import { useCloudSync } from './features/auth/useCloudSync'
import LoginGate from './features/auth/LoginGate'
import Mascot from './components/Mascot'
import { loadBackupFromCloud, applyCloudBackup } from './lib/cloudBackup'
import { seedIfEmpty } from './lib/seed'
import { useReminders } from './features/settings/useReminders'
import { ToastProvider } from './components/motion/ToastProvider'
import { db } from './lib/db'
import { awardDailyLoginBonusIfNeeded } from './lib/xp'

export default function App() {
  const { configured, user, loading } = useAuth()
  const [seeded, setSeeded] = useState(false)
  const [cloudChecked, setCloudChecked] = useState(!configured)

  useEffect(() => {
    seedIfEmpty().then(() => {
      awardDailyLoginBonusIfNeeded()
      setSeeded(true)
    })
  }, [])

  // Once signed in, pull down any existing cloud backup for this account
  // so progress follows the user to whatever device/browser they sign
  // into — a snapshot restore, not live sync (see lib/cloudBackup.ts).
  useEffect(() => {
    if (!configured || !user) return
    let cancelled = false
    setCloudChecked(false)
    loadBackupFromCloud(user.uid)
      .then((data) => (data ? applyCloudBackup(data) : undefined))
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setCloudChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [configured, user])

  useCloudSync(user, configured)
  useReminders()

  const settings = useLiveQuery(() => db.settings.get('app'), [])

  if (configured && (loading || (user && !cloudChecked))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Mascot pose="neutral" size={64} />
      </div>
    )
  }

  if (configured && !user) {
    return <LoginGate />
  }

  return (
    <ToastProvider>
      {seeded && settings && !settings.onboardingCompleted ? (
        <Onboarding />
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="learn" element={<Roadmap />} />
            <Route path="practice" element={<PracticeHub />} />
            <Route path="journal-speaking" element={<JournalSpeakingHub />} />
            <Route path="progress" element={<ProgressHub />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      )}
    </ToastProvider>
  )
}
