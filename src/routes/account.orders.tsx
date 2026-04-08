import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useCurrency } from '../components/CurrencyProvider'
import { useAuth } from '../components/AuthProvider'

type OrderItem = {
  productSlug: string
  productName: string
  unitPriceUgx: number
  quantity: number
  lineTotalUgx: number
}

type AccountOrder = {
  id: string
  orderNumber: string
  status: string
  customerName: string
  location: string
  subtotalUgx: number
  deliveryFeeUgx: number
  totalUgx: number
  createdAt: string
  items: OrderItem[]
}

export const Route = createFileRoute('/account/orders')({
  head: () => ({
    meta: [
      { title: 'My Orders | Hearth & Timber Uganda' },
      {
        name: 'description',
        content: 'View and track all your Hearth & Timber orders.',
      },
    ],
  }),
  component: AccountOrdersPage,
})

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-600',
  confirmed: 'text-blue-600',
  out_for_delivery: 'text-purple-600',
  delivered: 'text-green-700',
  cancelled: 'text-red-600',
}

function AccountOrdersPage() {
  const { user, loading, getIdToken } = useAuth()
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState<AccountOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) return

    let cancelled = false
    setFetching(true)
    setError(null)

    void (async () => {
      try {
        const token = await getIdToken()
        if (!token) throw new Error('Could not get auth token.')

        const response = await fetch('/api/account/orders', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = (await response.json()) as AccountOrder[] | { error: string }

        if (!response.ok || 'error' in data) {
          throw new Error(
            'error' in data ? (data as { error: string }).error : 'Failed to load orders.',
          )
        }

        if (!cancelled) {
          setOrders(data as AccountOrder[])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.')
        }
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, loading, getIdToken])

  if (loading) {
    return (
      <main className="page-wrap px-4 pb-12 pt-8">
        <p className="text-(--ink-soft)">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page-wrap px-4 pb-12 pt-8">
        <section className="cart-page-panel mx-auto mt-6 max-w-md text-center">
          <h1 className="m-0 text-2xl font-semibold text-(--ink)">Sign in to view your orders</h1>
          <p className="mt-3 text-sm text-(--ink-soft)">
            You need to be signed in to see your order history.
          </p>
          <Link to="/auth/login" className="btn-primary mt-4 inline-block no-underline">
            Sign In
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">My Orders</h1>
        <p className="mt-3 text-(--ink-soft)">
          All orders placed with your account ({user.email}).
        </p>
      </section>

      {fetching ? (
        <div className="cart-page-panel mx-auto mt-6 max-w-2xl reveal-in">
          <p className="text-sm text-(--ink-soft)">Loading your orders...</p>
        </div>
      ) : null}

      {error ? (
        <div className="cart-page-panel mx-auto mt-6 max-w-2xl reveal-in">
          <p className="field-error m-0">{error}</p>
        </div>
      ) : null}

      {orders !== null && orders.length === 0 ? (
        <div className="cart-page-panel mx-auto mt-6 max-w-2xl reveal-in text-center">
          <p className="text-(--ink-soft)">You have not placed any orders yet.</p>
          <Link to="/shop" className="btn-primary mt-4 inline-block no-underline">
            Start Shopping
          </Link>
        </div>
      ) : null}

      {orders && orders.length > 0 ? (
        <div className="mt-6 grid gap-5">
          {orders.map((order) => (
            <article key={order.id} className="cart-page-panel reveal-in">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-lg font-semibold text-(--ink)">
                    #{order.orderNumber}
                  </h2>
                  <p className="mt-1 text-sm text-(--ink-soft)">
                    {new Date(order.createdAt).toLocaleDateString('en-UG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${STATUS_COLORS[order.status] ?? 'text-(--ink)'}`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-4 border-t border-(--line) pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.productSlug}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-(--ink)">
                      {item.productName}{' '}
                      <span className="text-(--ink-soft)">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-(--ink)">
                      {formatPrice(item.lineTotalUgx)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-(--line) pt-3">
                <span className="text-sm text-(--ink-soft)">Total</span>
                <strong className="text-(--ink)">{formatPrice(order.totalUgx)}</strong>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  )
}
