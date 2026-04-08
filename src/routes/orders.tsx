import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCurrency } from '../components/CurrencyProvider'

type OrderLookupResponse = {
  ok?: boolean
  error?: string
  order?: {
    orderNumber: string
    customerName: string
    status: string
    location: string
    subtotalUgx: number
    totalUgx: number
    createdAt: string
    items: Array<{
      productSlug: string
      productName: string
      unitPriceUgx: number
      quantity: number
      lineTotalUgx: number
    }>
  }
}

async function fetchOrder(orderNumber: string) {
  const response = await fetch(
    `/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`,
  )
  const data = (await response.json()) as OrderLookupResponse

  if (!response.ok || !data.ok || !data.order) {
    throw new Error(data.error ?? 'Order not found.')
  }

  return data.order
}

export const Route = createFileRoute('/orders')({
  head: () => ({
    meta: [
      { title: 'Track Your Order | Homeline Furniture Uganda' },
      {
        name: 'description',
        content: 'Enter your order number to check your delivery status.',
      },
    ],
  }),
  component: OrderTrackingPage,
})

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending — awaiting confirmation',
  confirmed: 'Confirmed — being prepared',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function OrderTrackingPage() {
  const { formatPrice } = useCurrency()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')

  const orderQuery = useQuery({
    enabled: Boolean(submitted),
    queryKey: ['order-lookup', submitted],
    queryFn: () => fetchOrder(submitted),
    retry: false,
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim().toUpperCase()
    if (!trimmed) return
    setSubmitted(trimmed)
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Orders</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">Track Your Order</h1>
        <p className="mt-3 max-w-xl text-(--ink-soft)">
          Enter your order number (e.g. UG-20260401-1234) to check your
          delivery status. You received it in your order confirmation.
        </p>
      </section>

      <section className="cart-page-panel mx-auto mt-6 w-full max-w-xl reveal-in">
        <form className="inquiry-form" onSubmit={handleSubmit}>
          <label>
            Order Number
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="UG-20260401-1234"
              required
            />
          </label>
          <button type="submit" className="btn-primary w-full">
            Track Order
          </button>
        </form>
      </section>

      {orderQuery.isPending && submitted ? (
        <div className="cart-page-panel mx-auto mt-4 w-full max-w-xl reveal-in">
          Looking up your order...
        </div>
      ) : null}

      {orderQuery.isError ? (
        <div className="cart-page-panel mx-auto mt-4 w-full max-w-xl reveal-in">
          <p className="field-error m-0">
            {orderQuery.error instanceof Error
              ? orderQuery.error.message
              : 'Could not find that order.'}
          </p>
        </div>
      ) : null}

      {orderQuery.data ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="cart-page-panel reveal-in">
            <h2 className="m-0 text-xl">Order #{orderQuery.data.orderNumber}</h2>
            <p className="mt-2 text-sm text-(--ink-soft)">
              Placed: {new Date(orderQuery.data.createdAt).toLocaleString()}
            </p>
            <p className="m-0 mt-1 text-sm">
              Status:{' '}
              <strong>
                {STATUS_LABELS[orderQuery.data.status] ?? orderQuery.data.status}
              </strong>
            </p>

            <div className="cart-list mt-4">
              {orderQuery.data.items.map((item) => (
                <article
                  key={item.productSlug}
                  className="cart-item cart-item--wide"
                >
                  <div />
                  <div>
                    <p className="m-0 font-semibold">{item.productName}</p>
                    <p className="m-0 mt-1 text-sm text-(--ink-soft)">
                      {item.quantity} × {formatPrice(item.unitPriceUgx)}
                    </p>
                  </div>
                  <p className="cart-item-total">
                    {formatPrice(item.lineTotalUgx)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="cart-page-panel reveal-in">
            <h2 className="m-0 text-xl">Delivery Summary</h2>
            <p className="mt-3 text-sm text-(--ink-soft)">
              <strong>Customer:</strong> {orderQuery.data.customerName}
            </p>
            <p className="m-0 text-sm text-(--ink-soft)">
              <strong>Location:</strong> {orderQuery.data.location}
            </p>

            <div className="cart-summary mt-4">
              <p>
                <span>Subtotal</span>
                <strong>{formatPrice(orderQuery.data.subtotalUgx)}</strong>
              </p>
              <p>
                <span>Total</span>
                <strong>{formatPrice(orderQuery.data.totalUgx)}</strong>
              </p>
            </div>

            <div className="mt-4">
              <Link to="/shop" className="btn-muted no-underline text-center block">
                Continue Shopping
              </Link>
            </div>
          </aside>
        </section>
      ) : null}
    </main>
  )
}
