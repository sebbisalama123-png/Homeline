import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

export const Route = createFileRoute('/auth/signup')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirectTo?: string } => ({
    redirectTo:
      typeof search.redirectTo === 'string' ? search.redirectTo : undefined,
  }),
  component: SignupPage,
})

function mapFirebaseError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('email-already-in-use')) return 'An account with this email already exists.'
  if (value.includes('weak-password')) return 'Password is too weak. Use at least 6 characters.'
  if (value.includes('popup-closed')) return 'Google popup was closed before signup completed.'
  if (value.includes('operation-not-allowed')) return 'This sign-up method is not enabled in Firebase.'
  return message
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const { redirectTo } = Route.useSearch()
  const { signUpWithEmail, signInWithGoogle, sendVerificationEmail, configError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleEmailSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await signUpWithEmail(email.trim(), password)
      await sendVerificationEmail()
      setVerificationSent(true)
    } catch (cause) {
      setError(cause instanceof Error ? mapFirebaseError(cause.message) : 'Could not sign up.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setIsGooglePending(true)
    try {
      await signInWithGoogle()
      void navigate({ to: redirectTo ?? '/admin/orders' })
    } catch (cause) {
      setError(cause instanceof Error ? mapFirebaseError(cause.message) : 'Could not sign up.')
    } finally {
      setIsGooglePending(false)
    }
  }

  const anyPending = isSubmitting || isGooglePending

  if (verificationSent) {
    return (
      <main className="page-wrap px-4 pb-12 pt-8">
        <section className="shop-heading reveal-in">
          <p className="eyebrow mb-3">Account</p>
          <h1 className="display-title m-0 text-4xl sm:text-5xl">Check Your Email</h1>
          <p className="mt-3 max-w-xl text-(--ink-soft)">
            We sent a verification link to <strong>{email}</strong>. Click the
            link in the email to activate your account, then sign in.
          </p>
        </section>
        <section className="cart-page-panel mx-auto mt-6 w-full max-w-xl reveal-in">
          <Link to="/auth/login" className="btn-primary no-underline text-center block">
            Go to Sign In
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">Create Account</h1>
        <p className="mt-3 max-w-xl text-(--ink-soft)">
          Create your account with email/password or Google.
        </p>
      </section>

      <section className="cart-page-panel mx-auto mt-6 w-full max-w-xl reveal-in">
        {configError ? <p className="field-error">{configError}</p> : null}
        {error ? <p className="field-error">{error}</p> : null}

        {/* Google sign-up */}
        <button
          type="button"
          className="btn-google w-full"
          onClick={handleGoogleSignup}
          disabled={anyPending}
        >
          {isGooglePending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-sm text-(--ink-soft)">
          <span className="h-px flex-1 bg-(--line)" />
          or
          <span className="h-px flex-1 bg-(--line)" />
        </div>

        <form className="inquiry-form" onSubmit={handleEmailSignup}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourstore.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </label>

          <button
            type="submit"
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
            disabled={anyPending}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSubmitting ? 'Creating Account…' : 'Sign Up with Email'}
          </button>
        </form>

        <p className="mt-4 text-sm text-(--ink-soft)">
          Already have an account?{' '}
          <Link to="/auth/login" className="section-link">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
