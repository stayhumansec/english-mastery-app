import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, firebaseConfigured, googleProvider } from '../../lib/firebase'

interface AuthContextValue {
  /** Whether this deployment even has Firebase configured. When false,
   * the app runs in the original local-only mode (no login gate) —
   * lets dev/preview environments without real Firebase env vars keep
   * working exactly as before. */
  configured: boolean
  user: User | null
  /** True until the initial auth-state check resolves. */
  loading: boolean
  signIn: () => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(firebaseConfigured)

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = async () => {
    if (!auth) return
    await signInWithPopup(auth, googleProvider)
  }

  const signOutUser = async () => {
    if (!auth) return
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ configured: firebaseConfigured, user, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}
