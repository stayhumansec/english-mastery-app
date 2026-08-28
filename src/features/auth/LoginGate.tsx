import { useState } from 'react'
import { motion } from 'framer-motion'
import Mascot from '../../components/Mascot'
import { useAuth } from './AuthProvider'

export default function LoginGate() {
  const { signIn } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSignIn = async () => {
    setError('')
    setBusy(true)
    try {
      await signIn()
    } catch {
      setError("Couldn't sign in — please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card blob-decoration w-full max-w-sm space-y-5 p-8 text-center"
        style={{ ['--blob-color' as string]: 'var(--accent)' }}
      >
        <div className="blob-content space-y-5">
          <Mascot pose="wave" size={88} className="mx-auto" />
          <div>
            <h1 className="page-title">English Mastery</h1>
            <p className="body-text mt-1 text-[var(--text-muted)]">
              Sign in to save your progress to your account and pick up where you left off on any device.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={busy}
            className="btn btn-secondary flex w-full items-center justify-center gap-3 py-2.5 text-sm disabled:opacity-60"
          >
            <GoogleIcon />
            {busy ? 'Signing in…' : 'Continue with Google'}
          </button>
          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
          <p className="text-xs text-[var(--text-muted)]">
            Your data is private to your account — nobody else can see it.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  )
}
