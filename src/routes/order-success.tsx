import { Link, createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/order-success')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { orderNumber?: string } => ({
    orderNumber:
      typeof search.orderNumber === 'string' ? search.orderNumber : undefined,
  }),
  component: OrderSuccessPage,
})

async function fetchOrder(orderNumber: string) {
  const response = await fetch(
    `/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`,
  )
  const data = (await response.json()) as OrderLookupResponse

  if (!response.ok || !data.ok || !data.order) {
    throw new Error(data.error ?? 'Could not load order details.')
  }

  return data.order
}

function OrderSuccessPage() {
  const { formatPrice } = useCurrency()
  const { orderNumber } = Route.useSearch()

  const orderQuery = useQuery({
    enabled: Boolean(orderNumber),
    queryKey: ['order-success', orderNumber],
    queryFn: () => fetchOrder(orderNumber ?? ''),
  })

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Order Placed</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">
          Thank You For Your Order
        </h1>
        <p className="mt-3 max-w-2xl text-(--ink-soft)">
          Your COD order has been received. Our team will call you shortly to
          confirm delivery details.
        </p>
      </section>

      {!orderNumber ? (
        <div className="cart-page-panel mt-6 reveal-in">
          <p className="field-error m-0">Missing order number.</p>
          <Link
            to="/shop"
            className="btn-primary mt-4 inline-block no-underline"
          >
            Continue Shopping
          </Link>
        </div>
      ) : null}

      {orderQuery.isPending ? (
        <div className="cart-page-panel mt-6 reveal-in">
          Loading order details...
        </div>
      ) : null}

      {orderQuery.isError ? (
        <div className="cart-page-panel mt-6 reveal-in">
          <p className="field-error m-0">
            {orderQuery.error instanceof Error
              ? orderQuery.error.message
              : 'Could not load order details.'}
          </p>
        </div>
      ) : null}

      {orderQuery.data ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="cart-page-panel reveal-in">
            <h2 className="m-0 text-xl">Order Details</h2>
            <p className="mt-2 text-sm text-(--ink-soft)">
              Order Number: <strong>{orderQuery.data.orderNumber}</strong>
            </p>
            <p className="m-0 text-sm text-(--ink-soft)">
              Status: <strong>{orderQuery.data.status}</strong>
            </p>
            <p className="m-0 mt-1 text-sm text-(--ink-soft)">
              Placed: {new Date(orderQuery.data.createdAt).toLocaleString()}
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
                      {item.quantity} x {formatPrice(item.unitPriceUgx)}
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

            <div className="mt-4 grid gap-2">
              <Link to="/shop" className="btn-primary no-underline text-center">
                Continue Shopping
              </Link>
              <Link to="/cart" className="btn-muted no-underline text-center">
                Back to Cart
              </Link>
            </div>
          </aside>
        </section>
      ) : null}
    </main>
  )
}
