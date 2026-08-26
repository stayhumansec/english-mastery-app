import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './routes/Layout'
import Dashboard from './features/dashboard/Dashboard'
import Roadmap from './features/roadmap/Roadmap'
import CalendarPage from './features/calendar/CalendarPage'
import TimerPage from './features/timer/TimerPage'
import FlashcardsPage from './features/flashcards/FlashcardsPage'
import AccentPage from './features/accent/AccentPage'
import SettingsPage from './features/settings/SettingsPage'
import { seedIfEmpty } from './lib/seed'
import { useReminders } from './features/settings/useReminders'

export default function App() {
  useEffect(() => {
    seedIfEmpty()
  }, [])

  useReminders()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="timer" element={<TimerPage />} />
        <Route path="flashcards" element={<FlashcardsPage />} />
        <Route path="accent" element={<AccentPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
