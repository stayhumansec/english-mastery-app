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
import { seedIfEmpty } from './lib/seed'
import { useReminders } from './features/settings/useReminders'
import { ToastProvider } from './components/motion/ToastProvider'
import { db } from './lib/db'
import { awardDailyLoginBonusIfNeeded } from './lib/xp'

export default function App() {
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    seedIfEmpty().then(() => {
      awardDailyLoginBonusIfNeeded()
      setSeeded(true)
    })
  }, [])

  useReminders()

  const settings = useLiveQuery(() => db.settings.get('app'), [])

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
