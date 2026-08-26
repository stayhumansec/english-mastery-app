import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  Home,
  Layers,
  Map,
  Mic,
  PenLine,
  Settings,
  Sparkles,
  Timer,
} from 'lucide-react'
import { FEATURE_COLORS, type FeatureKey } from '../lib/types'
import PageTransition from '../components/motion/PageTransition'

const NAV_ITEMS: Array<{ to: string; label: string; icon: typeof Home; end?: boolean; feature: FeatureKey }> = [
  { to: '/', label: 'Home', icon: Home, end: true, feature: 'home' },
  { to: '/roadmap', label: 'Roadmap', icon: Map, feature: 'roadmap' },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, feature: 'calendar' },
  { to: '/timer', label: 'Timer', icon: Timer, feature: 'timer' },
  { to: '/flashcards', label: 'Flashcards', icon: Layers, feature: 'flashcards' },
  { to: '/input', label: 'Input Log', icon: BookOpen, feature: 'input' },
  { to: '/journal', label: 'Journal', icon: PenLine, feature: 'journal' },
  { to: '/drills', label: 'Drills', icon: Sparkles, feature: 'drills' },
  { to: '/patterns', label: 'Patterns', icon: Sparkles, feature: 'patterns' },
  { to: '/accent', label: 'Speaking', icon: Mic, feature: 'accent' },
  { to: '/settings', label: 'Settings', icon: Settings, feature: 'settings' },
]

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <nav className="hidden shrink-0 flex-col gap-1 border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex md:w-56">
        <div className="mb-4 px-2 text-lg font-black text-[var(--text)]">
          English <span style={{ color: 'var(--accent)' }}>Mastery</span>
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, feature }) => (
          <NavLink key={to} to={to} end={end} className="relative">
            {({ isActive }) => (
              <span
                className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-full"
                    style={{ background: `${FEATURE_COLORS[feature]}22` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className="relative" style={{ color: FEATURE_COLORS[feature] }} />
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-4 pt-4 pb-20 md:px-8 md:pb-8">
        <PageTransition />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--surface)] px-1 py-1.5 md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, feature }) => (
          <NavLink key={to} to={to} end={end} className="relative shrink-0">
            {({ isActive }) => (
              <span
                className={`relative flex flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${
                  isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill-mobile"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: `${FEATURE_COLORS[feature]}22` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={20} className="relative" style={{ color: FEATURE_COLORS[feature] }} />
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
