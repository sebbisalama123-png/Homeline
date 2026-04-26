import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { CheckCircle2, Download, X } from 'lucide-react'
import { useCurrency } from '../components/CurrencyProvider'

type OrderLookupResponse = {
  ok?: boolean
  error?: string
  order?: OrderData
}

type OrderData = {
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

function ugx(amount: number) {
  return `UGX ${amount.toLocaleString('en-UG')}`
}

async function downloadReceipt(order: OrderData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 20
  const col2 = W - margin
  let y = 20

  const accent = '#8e5f35'
  const ink = '#1f1d19'
  const soft = '#8a7a68'

  // Header band
  doc.setFillColor(142, 95, 53)
  doc.rect(0, 0, W, 36, 'F')
  doc.setTextColor('#ffffff')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Homeline Furniture Uganda', W / 2, 16, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Order Receipt', W / 2, 25, { align: 'center' })

  y = 50

  // Order meta
  doc.setTextColor(ink)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER NUMBER', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(order.orderNumber, margin + 38, y)

  doc.setFont('helvetica', 'bold')
  doc.text('DATE', col2 - 38, y, { align: 'left' })
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(dateStr, col2, y, { align: 'right' })

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('CUSTOMER', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(order.customerName, margin + 38, y)

  doc.setFont('helvetica', 'bold')
  doc.text('STATUS', col2 - 38, y, { align: 'left' })
  doc.setFont('helvetica', 'normal')
  doc.text(order.status.toUpperCase(), col2, y, { align: 'right' })

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('LOCATION', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(order.location, margin + 38, y)

  // Divider
  y += 10
  doc.setDrawColor(214, 197, 175)
  doc.setLineWidth(0.4)
  doc.line(margin, y, col2, y)

  // Items table header
  y += 7
  doc.setFillColor(245, 242, 236)
  doc.rect(margin, y - 4, col2 - margin, 8, 'F')
  doc.setTextColor(soft)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('ITEM', margin + 2, y)
  doc.text('QTY', 130, y, { align: 'center' })
  doc.text('UNIT PRICE', 160, y, { align: 'right' })
  doc.text('TOTAL', col2, y, { align: 'right' })

  // Items
  y += 7
  doc.setTextColor(ink)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  for (const item of order.items) {
    doc.text(item.productName, margin + 2, y)
    doc.text(String(item.quantity), 130, y, { align: 'center' })
    doc.text(ugx(item.unitPriceUgx), 160, y, { align: 'right' })
    doc.text(ugx(item.lineTotalUgx), col2, y, { align: 'right' })
    y += 7

    doc.setDrawColor(235, 228, 218)
    doc.setLineWidth(0.2)
    doc.line(margin, y - 2, col2, y - 2)
  }

  // Totals
  y += 4
  const deliveryFee = order.totalUgx - order.subtotalUgx

  doc.setFontSize(9)
  doc.setTextColor(soft)
  doc.text('Subtotal', 140, y, { align: 'right' })
  doc.setTextColor(ink)
  doc.text(ugx(order.subtotalUgx), col2, y, { align: 'right' })

  y += 6
  doc.setTextColor(soft)
  doc.text('Delivery', 140, y, { align: 'right' })
  doc.setTextColor(ink)
  doc.text(deliveryFee === 0 ? 'Free' : ugx(deliveryFee), col2, y, {
    align: 'right',
  })

  y += 3
  doc.setDrawColor(142, 95, 53)
  doc.setLineWidth(0.5)
  doc.line(120, y, col2, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(accent)
  doc.text('TOTAL (COD)', 140, y, { align: 'right' })
  doc.text(ugx(order.totalUgx), col2, y, { align: 'right' })

  // Payment note
  y += 14
  doc.setDrawColor(214, 197, 175)
  doc.setLineWidth(0.4)
  doc.line(margin, y, col2, y)

  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(soft)
  doc.text('Payment method: Cash on Delivery', margin, y)

  // Coming-soon email note
  y += 14
  doc.setFillColor(255, 248, 235)
  doc.setDrawColor(214, 197, 175)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y - 5, col2 - margin, 18, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(accent)
  doc.text('Email receipts coming soon', margin + 5, y + 2)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(soft)
  doc.text(
    'We are working on automatically emailing receipts like this one to',
    margin + 5,
    y + 8,
  )
  doc.text(
    'you after every order. Stay tuned — it will be live very soon.',
    margin + 5,
    y + 13,
  )

  // Footer
  y = 272
  doc.setFillColor(142, 95, 53)
  doc.rect(0, y, W, 25, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor('#ffffff')
  doc.text('Homeline Furniture Uganda', W / 2, y + 8, { align: 'center' })
  doc.text(
    'WhatsApp: +256 704 579 980  ·  studio@hearthandtimber.ug',
    W / 2,
    y + 14,
    { align: 'center' },
  )
  doc.setTextColor(200, 190, 185)
  doc.text(
    `© ${new Date().getFullYear()} Homeline Furniture Uganda`,
    W / 2,
    y + 20,
    { align: 'center' },
  )

  doc.save(`receipt-${order.orderNumber}.pdf`)
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

function ReceiptDialog({
  order,
  onClose,
}: {
  order: OrderData
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(31,29,25,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl"
        style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-(--ink-soft) hover:text-(--ink)"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'rgba(142,95,53,0.12)' }}
        >
          <CheckCircle2 size={28} style={{ color: '#8e5f35' }} />
        </div>

        <h2 className="m-0 text-xl font-bold" style={{ color: 'var(--ink)' }}>
          Order Confirmed!
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>
          #{order.orderNumber}
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Your receipt is ready. Download it now to keep a copy of your order details.
        </p>

        <button
          type="button"
          className="btn-primary mt-5 flex w-full items-center justify-center gap-2"
          onClick={() => {
            void downloadReceipt(order)
            onClose()
          }}
        >
          <Download size={15} />
          Download Receipt (PDF)
        </button>
        <button
          type="button"
          className="mt-3 w-full text-sm"
          style={{ color: 'var(--ink-soft)' }}
          onClick={onClose}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

function OrderSuccessPage() {
  const { formatPrice } = useCurrency()
  const { orderNumber } = Route.useSearch()
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)

  const orderQuery = useQuery({
    enabled: Boolean(orderNumber),
    queryKey: ['order-success', orderNumber],
    queryFn: () => fetchOrder(orderNumber ?? ''),
  })

  useEffect(() => {
    if (orderQuery.data) {
      setShowReceiptDialog(true)
    }
  }, [orderQuery.data])

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
              <button
                type="button"
                className="btn-primary flex items-center justify-center gap-2"
                onClick={() => void downloadReceipt(orderQuery.data)}
              >
                <Download size={15} />
                Download Receipt (PDF)
              </button>
              <Link to="/shop" className="btn-muted no-underline text-center">
                Continue Shopping
              </Link>
            </div>
          </aside>
        </section>
      ) : null}

      {showReceiptDialog && orderQuery.data ? (
        <ReceiptDialog
          order={orderQuery.data}
          onClose={() => setShowReceiptDialog(false)}
        />
      ) : null}
    </main>
  )
}
