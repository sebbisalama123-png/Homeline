import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  auth,
  getFirebaseConfigError,
  googleProvider,
  type FirebaseUser,
} from '../lib/firebase/client'

type AuthContextValue = {
  user: FirebaseUser | null
  loading: boolean
  isAdmin: boolean
  configError: string | null
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  logOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseAdminEmails() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS
  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map((entry: string) => entry.trim().toLowerCase())
    .filter(Boolean)
}

const ADMIN_EMAILS = parseAdminEmails()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const configError = getFirebaseConfigError()

  async function hydrateUserProfile(nextUser: FirebaseUser | null) {
    if (!nextUser) {
      setUser(null)
      return
    }

    try {
      // Firebase sometimes lags photo/profile fields until a refresh.
      await nextUser.reload()
      setUser(auth?.currentUser ?? nextUser)
    } catch {
      setUser(nextUser)
    }
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      void hydrateUserProfile(nextUser)
      setLoading(false)

      // Sync verified users to the database so we can look up orders by account
      if (nextUser?.emailVerified) {
        void nextUser.getIdToken().then((token) => {
          void fetch('/api/auth/sync', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
        })
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: Boolean(
        user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()),
      ),
      configError,
      signInWithGoogle: async () => {
        if (!auth) {
          throw new Error(configError ?? 'Firebase auth is unavailable.')
        }
        const result = await signInWithPopup(auth, googleProvider)
        await hydrateUserProfile(result.user)
      },
      signInWithEmail: async (email, password) => {
        if (!auth) {
          throw new Error(configError ?? 'Firebase auth is unavailable.')
        }
        await signInWithEmailAndPassword(auth, email, password)
      },
      signUpWithEmail: async (email, password) => {
        if (!auth) {
          throw new Error(configError ?? 'Firebase auth is unavailable.')
        }
        await createUserWithEmailAndPassword(auth, email, password)
      },
      sendVerificationEmail: async () => {
        if (!auth?.currentUser) {
          throw new Error('No signed-in user to verify.')
        }
        await sendEmailVerification(auth.currentUser)
      },
      logOut: async () => {
        if (!auth) {
          return
        }
        await signOut(auth)
      },
      getIdToken: async () => {
        if (!auth?.currentUser) {
          return null
        }

        return auth.currentUser.getIdToken()
      },
    }),
    [configError, loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
