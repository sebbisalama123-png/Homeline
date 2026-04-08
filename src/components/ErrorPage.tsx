import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Logo from './Logo'

interface ErrorPageProps {
  error: Error
  reset?: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter()

  const message =
    error?.message && error.message.length < 120
      ? error.message
      : 'Something went wrong while loading this page.'

  return (
    <div className="not-found-page">
      <div className="not-found-page__inner">
        <Logo size={52} />
        <p className="not-found-page__code error-code">Error</p>
        <h1 className="not-found-page__title">Something went wrong</h1>
        <p className="not-found-page__sub">{message}</p>
        <div className="not-found-page__actions">
          {reset ? (
            <button
              type="button"
              className="not-found-page__btn-primary"
              onClick={() => {
                reset()
                void router.invalidate()
              }}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          ) : null}
          <Link to="/" className="not-found-page__btn-ghost no-underline">
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
