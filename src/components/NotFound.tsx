import { Link } from '@tanstack/react-router'
import { ArrowLeft, Search } from 'lucide-react'
import Logo from './Logo'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__inner">
        <Logo size={52} />
        <p className="not-found-page__code">404</p>
        <h1 className="not-found-page__title">Page not found</h1>
        <p className="not-found-page__sub">
          The page you're looking for may have moved, or the link might be
          incorrect. Let's get you back on track.
        </p>
        <div className="not-found-page__actions">
          <Link to="/" className="not-found-page__btn-primary no-underline">
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <Link to="/shop" className="not-found-page__btn-ghost no-underline">
            <Search size={15} />
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  )
}
