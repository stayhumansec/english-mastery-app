import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Values come from Vite env vars (see .env.example) so the real project
// config isn't hardcoded into source — set these in a local .env file
// (VITE_FIREBASE_*) and, for the deployed site, as GitHub Actions secrets
// consumed by the build step. These are Firebase's public client
// identifiers, not secrets — safety comes from Firestore security rules,
// not from hiding this config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** True once real Firebase config values are present. Lets the app fall
 * back to local-only mode (no login gate) instead of crashing when the
 * env vars haven't been set yet — e.g. in this dev sandbox. */
export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const googleProvider = new GoogleAuthProvider()
