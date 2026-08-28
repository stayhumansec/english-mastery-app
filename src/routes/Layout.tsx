import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, LogOut, Map, PenLine, Settings, Target, Trophy } from 'lucide-react'
import { FEATURE_COLORS, type FeatureKey } from '../lib/types'
import PageTransition from '../components/motion/PageTransition'
import IconBadge from '../components/IconBadge'
import { useAuth } from '../features/auth/AuthProvider'
import { saveBackupToCloud } from '../lib/cloudBackup'

// Consolidated down to 6 primary destinations (Part 1 §1). Calendar stays
// fully functional but is reached via a link from Home instead of a
// top-level nav slot; Timer lives as a tab inside Practice.
const NAV_ITEMS: Array<{ to: string; label: string; icon: typeof Home; end?: boolean; feature: FeatureKey }> = [
  { to: '/', label: 'Home', icon: Home, end: true, feature: 'home' },
  { to: '/learn', label: 'Learn', icon: Map, feature: 'learn' },
  { to: '/practice', label: 'Practice', icon: Target, feature: 'practice' },
  { to: '/journal-speaking', label: 'Journal', icon: PenLine, feature: 'journalSpeaking' },
  { to: '/progress', label: 'Progress', icon: Trophy, feature: 'progress' },
  { to: '/settings', label: 'Settings', icon: Settings, feature: 'settings' },
]

export default function Layout() {
  const { configured, user, signOutUser } = useAuth()

  const handleSignOut = async () => {
    if (user) await saveBackupToCloud(user.uid).catch(() => undefined)
    await signOutUser()
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <nav className="hidden shrink-0 flex-col gap-1 border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex md:w-56">
        <div className="font-display mb-4 px-2 text-lg font-black text-[var(--text)]">
          English <span style={{ color: 'var(--accent)' }}>Mastery</span>
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, feature }) => (
          <NavLink key={to} to={to} end={end} className="relative">
            {({ isActive }) => (
              <span
                className={`relative flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition-colors ${
                  isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-full"
                    style={{ background: `${FEATURE_COLORS[feature]}1a` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">
                  <IconBadge icon={Icon} color={FEATURE_COLORS[feature]} size={26} />
                </span>
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}

        {configured && user && (
          <div className="mt-auto flex items-center gap-2 rounded-xl border border-[var(--border)] p-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-8 w-8 shrink-0 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold" style={{ color: 'var(--accent-dark)' }}>
                {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--text-muted)]">
              {user.displayName ?? user.email}
            </span>
            <button onClick={handleSignOut} className="shrink-0 text-[var(--text-muted)] hover:text-red-500" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>

      <main className="content-texture flex-1 px-4 pt-4 pb-20 md:px-8 md:pb-8">
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
                    style={{ background: `${FEATURE_COLORS[feature]}1a` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">
                  <IconBadge icon={Icon} color={FEATURE_COLORS[feature]} size={24} />
                </span>
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
