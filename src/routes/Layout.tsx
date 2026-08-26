import { NavLink, Outlet } from 'react-router-dom'
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

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/timer', label: 'Timer', icon: Timer },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
  { to: '/input', label: 'Input Log', icon: BookOpen },
  { to: '/journal', label: 'Journal', icon: PenLine },
  { to: '/drills', label: 'Drills', icon: Sparkles },
  { to: '/patterns', label: 'Patterns', icon: Sparkles },
  { to: '/accent', label: 'Speaking', icon: Mic },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <nav className="hidden shrink-0 flex-col gap-1 border-r border-[var(--border)] p-4 md:flex md:w-56">
        <div className="mb-4 px-2 text-lg font-semibold">English Mastery</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--accent-soft)]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-4 pt-4 pb-20 md:px-8 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--surface)] px-1 py-1.5 md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] whitespace-nowrap ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
