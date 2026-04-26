import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  X,
} from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import Logo from './Logo'
import { useCart } from './CartProvider'
import { useCurrency } from './CurrencyProvider'
import { useAuth } from './AuthProvider'
import { catalogCategories, categoryToSlug } from '../data/catalog'

export default function Header() {
  const { formatPrice } = useCurrency()
  const { user, isAdmin, logOut } = useAuth()
  const { items, cartCount, subtotal, increment, decrement, remove } = useCart()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLElement>(null)
  const searchPanelRef = useRef<HTMLElement>(null)
  const cartPanelRef = useRef<HTMLElement>(null)
  const wasMenuOpen = useRef(false)
  const wasSearchOpen = useRef(false)
  const wasCartOpen = useRef(false)

  const isAnyOpen = isMenuOpen || isSearchOpen || isCartOpen

  useEffect(() => {
    if (isAnyOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isAnyOpen])

  useEffect(() => {
    if (isSearchOpen) {
      document.getElementById('search-input')?.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAnyOpen) {
        closeAll()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isAnyOpen])

  useEffect(() => {
    if (isMenuOpen) {
      menuPanelRef.current
        ?.querySelector<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus()
    }
    if (wasMenuOpen.current && !isMenuOpen) {
      menuButtonRef.current?.focus()
    }
    wasMenuOpen.current = isMenuOpen
  }, [isMenuOpen])

  useEffect(() => {
    if (isSearchOpen) {
      searchPanelRef.current
        ?.querySelector<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus()
    }
    if (wasSearchOpen.current && !isSearchOpen) {
      searchButtonRef.current?.focus()
    }
    wasSearchOpen.current = isSearchOpen
  }, [isSearchOpen])

  useEffect(() => {
    if (isCartOpen) {
      cartPanelRef.current
        ?.querySelector<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus()
    }
    if (wasCartOpen.current && !isCartOpen) {
      cartButtonRef.current?.focus()
    }
    wasCartOpen.current = isCartOpen
  }, [isCartOpen])

  const closeAll = () => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    setIsCartOpen(false)
  }

  const trapFocus = (
    event: ReactKeyboardEvent<HTMLElement>,
    container: HTMLElement | null,
  ) => {
    if (event.key !== 'Tab' || !container) {
      return
    }

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )

    if (focusables.length === 0) {
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    }
  }

  const submitSearch = () => {
    const q = searchTerm.trim()
    void navigate({
      to: '/shop',
      search: q.length > 0 ? { q } : {},
    })
    closeAll()
  }

  return (
    <>
      <header className="site-header sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) backdrop-blur-xl">
        <div className="announcement-bar px-4 py-2 text-center text-xs font-semibold tracking-[0.08em] sm:text-sm">
          FREE DELIVERY IN KAMPALA ON ORDERS OVER UGX 1,500,000
        </div>

        <nav className="page-wrap px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Link to="/" className="brand-mark no-underline">
              <Logo size={26} />
              Homeline Furniture
            </Link>

            <button
              type="button"
              className="icon-btn header-menu-btn ml-auto md:hidden"
              ref={menuButtonRef}
              onClick={() => {
                setIsMenuOpen(true)
                setIsSearchOpen(false)
                setIsCartOpen(false)
              }}
              aria-label="Open menu"
            >
              <Menu size={18} />
              <span className="sr-only">Menu</span>
            </button>

            <form
              className="search-shell hidden min-w-47.5 flex-1 md:flex md:max-w-xl"
              onSubmit={(event) => {
                event.preventDefault()
                submitSearch()
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  d="M10.5 3a7.5 7.5 0 015.96 12.06l4.24 4.24-1.4 1.4-4.24-4.24A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Search sofas, beds, dining sets..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full border-0 bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
              />
            </form>

            <button
              type="button"
              className="icon-btn md:hidden"
              ref={searchButtonRef}
              onClick={() => {
                setIsSearchOpen(true)
                setIsMenuOpen(false)
                setIsCartOpen(false)
              }}
              aria-label="Open search"
            >
              <Search size={18} />
              <span className="sr-only">Search</span>
            </button>

            <ThemeSwitcher variant="pill" />

            {user && !isAdmin ? (
              <Link
                to="/account/orders"
                className="header-chip hidden no-underline md:inline-flex"
              >
                <Package size={14} />
                My Orders
              </Link>
            ) : null}
            {!user ? (
              <Link
                to="/auth/login"
                className="header-chip hidden no-underline md:inline-flex"
              >
                <LogIn size={14} />
                Sign In
              </Link>
            ) : null}
            <button
              type="button"
              className="header-chip relative"
              ref={cartButtonRef}
              onClick={() => {
                setIsCartOpen(true)
                setIsMenuOpen(false)
                setIsSearchOpen(false)
              }}
              aria-label={`Open cart (${cartCount} items)`}
            >
              <ShoppingCart size={16} />
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8d4f22] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
              <span className="sr-only">Cart</span>
            </button>
          </div>

          <div className="hidden flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold md:flex">
            <Link
              to="/shop"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Shop All
            </Link>
            {catalogCategories.map((category) => (
              <Link
                key={category}
                to="/shop/$category"
                params={{ category: categoryToSlug(category) }}
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                {category}
              </Link>
            ))}
            <Link
              to="/orders"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              <MapPin size={13} />
              Track Order
            </Link>
            <Link
              to="/about"
              className="nav-link ml-auto"
              activeProps={{ className: 'nav-link is-active ml-auto' }}
            >
              Our Story
            </Link>
            {isAdmin ? (
              <Link
                to="/admin/orders"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                <LayoutDashboard size={13} />
                Admin
              </Link>
            ) : null}
            <Link
              to="/settings"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
              aria-label="Settings"
            >
              <Settings size={13} />
            </Link>
          </div>
        </nav>
      </header>

      <div
        className={`drawer-overlay ${isAnyOpen ? 'is-open' : ''}`}
        role="presentation"
        onClick={closeAll}
      />

      <aside
        ref={menuPanelRef}
        className={`drawer-panel drawer-panel--left ${isMenuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        tabIndex={-1}
        onKeyDown={(event) => trapFocus(event, menuPanelRef.current)}
        onClick={(event) => event.stopPropagation()}
      >
        {/* ── Sidebar header ── */}
        <div className="sidebar-header">
          <Link to="/" className="brand-mark no-underline" onClick={closeAll}>
            <Logo size={22} />
            Homeline Furniture
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeAll}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── User card ── */}
        {user ? (
          <div className="sidebar-user">
            <div className="sidebar-user__avatar">
              {user.displayName
                ? user.displayName[0].toUpperCase()
                : user.email
                  ? user.email[0].toUpperCase()
                  : '?'}
            </div>
            <div className="sidebar-user__info">
              <p className="sidebar-user__name">
                {user.displayName ?? 'My Account'}
              </p>
              <p className="sidebar-user__email">{user.email}</p>
            </div>
          </div>
        ) : (
          <Link
            to="/auth/login"
            className="sidebar-signin-cta no-underline"
            onClick={closeAll}
          >
            <LogIn size={16} />
            Sign in to your account
          </Link>
        )}

        {/* ── Scrollable middle ── */}
        <div className="sidebar-scroll">
          {/* ── Shop links ── */}
          <div className="sidebar-section">
            <p className="sidebar-section__label">Shop</p>
            <div className="drawer-links">
              <Link to="/shop" className="drawer-link" onClick={closeAll}>
                All Products
              </Link>
              {catalogCategories.map((category) => (
                <Link
                  key={category}
                  to="/shop/$category"
                  params={{ category: categoryToSlug(category) }}
                  className="drawer-link"
                  onClick={closeAll}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Account + utility links ── */}
          <div className="sidebar-section">
            <p className="sidebar-section__label">Account</p>
            <div className="drawer-links">
              {user && !isAdmin ? (
                <Link
                  to="/account/orders"
                  className="drawer-link flex items-center gap-2"
                  onClick={closeAll}
                >
                  <Package size={15} /> My Orders
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  to="/admin/orders"
                  className="drawer-link flex items-center gap-2"
                  onClick={closeAll}
                >
                  <LayoutDashboard size={15} /> Admin Panel
                </Link>
              ) : null}
              <Link
                to="/orders"
                className="drawer-link flex items-center gap-2"
                onClick={closeAll}
              >
                <MapPin size={15} /> Track Order
              </Link>
              <Link
                to="/about"
                className="drawer-link flex items-center gap-2"
                onClick={closeAll}
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
        {/* end sidebar-scroll */}

        {/* ── Bottom actions ── */}
        <div className="sidebar-footer">
          <div className="sidebar-footer__theme">
            <span className="sidebar-section__label" style={{ margin: 0 }}>
              Theme
            </span>
            <ThemeSwitcher variant="pill" />
          </div>
          <Link
            to="/settings"
            className="drawer-link flex items-center gap-2"
            onClick={closeAll}
          >
            <Settings size={15} /> Settings
          </Link>
          {user ? (
            <button
              type="button"
              className="sidebar-signout-btn"
              onClick={() => {
                void logOut()
                closeAll()
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          ) : null}
        </div>
      </aside>

      <aside
        ref={searchPanelRef}
        className={`drawer-panel drawer-panel--top ${isSearchOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        tabIndex={-1}
        onKeyDown={(event) => trapFocus(event, searchPanelRef.current)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <h2>Search</h2>
          <button
            type="button"
            className="header-chip"
            onClick={closeAll}
            aria-label="Close search"
          >
            <X size={15} />
          </button>
        </div>
        <form
          className="search-shell mt-3"
          onSubmit={(event) => {
            event.preventDefault()
            submitSearch()
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M10.5 3a7.5 7.5 0 015.96 12.06l4.24 4.24-1.4 1.4-4.24-4.24A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
              fill="currentColor"
            />
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Search sofas, beds, dining sets..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full border-0 bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
          />
        </form>
        <div className="mt-4">
          <p className="eyebrow mb-2">Popular searches</p>
          <div className="shop-chips">
            {['Sofas', 'Dining Set', 'Bedroom', 'Storage'].map((term) => (
              <button
                key={term}
                type="button"
                className="chip"
                onClick={() => {
                  setSearchTerm(term)
                  void navigate({ to: '/shop', search: { q: term } })
                  closeAll()
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <aside
        ref={cartPanelRef}
        className={`drawer-panel drawer-panel--right ${isCartOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        onKeyDown={(event) => trapFocus(event, cartPanelRef.current)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <h2 className="flex items-center gap-2">
            <ShoppingCart size={18} /> Your Cart ({cartCount})
          </h2>
          <button
            type="button"
            className="header-chip"
            onClick={closeAll}
            aria-label="Close cart"
          >
            <X size={15} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-4 text-sm text-(--ink-soft)">
            Your cart is empty. Start with our featured collections.
          </p>
        ) : (
          <div className="cart-list mt-4">
            {items.map((item) => (
              <article key={item.slug} className="cart-item">
                <img src={item.image} alt={item.name} loading="lazy" />
                <div>
                  <p className="m-0 font-semibold">{item.name}</p>
                  <p className="m-0 mt-1 text-sm text-(--ink-soft)">
                    {formatPrice(item.unitPrice)}
                  </p>
                  <div className="cart-qty mt-2">
                    <button type="button" onClick={() => decrement(item.slug)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => increment(item.slug)}>
                      +
                    </button>
                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => remove(item.slug)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="cart-summary">
          <p>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </p>
          <Link
            to="/cart"
            className="btn-primary w-full no-underline text-center"
            onClick={closeAll}
          >
            Proceed to Inquiry Checkout
          </Link>
        </div>
      </aside>
    </>
  )
}
