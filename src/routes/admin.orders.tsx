import { createFileRoute } from '@tanstack/react-router'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  PackageCheck,
  Truck,
  X,
} from 'lucide-react'
import { useAuth } from '../components/AuthProvider'
import { useCurrency } from '../components/CurrencyProvider'
import { Select } from '../components/ui/Select'
import {
  ORDER_STATUSES,
  canTransitionOrderStatus,
  type OrderStatus,
} from '../lib/validation/order'

type AdminOrder = {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  location: string
  status: string
  totalUgx: number
  itemCount: number
  createdAt: string
}

const PAGE_SIZE = 20

type OrdersResponse = {
  ok?: boolean
  error?: string
  orders?: AdminOrder[]
  total?: number
  hasMore?: boolean
}

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
})

async function fetchOrders(
  status: string,
  token: string,
  offset = 0,
): Promise<{ orders: AdminOrder[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })
  if (status !== 'all') params.set('status', status)
  const response = await fetch(`/api/admin/orders?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await response.json()) as OrdersResponse
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? 'Could not load orders.')
  }
  return {
    orders: data.orders ?? [],
    total: data.total ?? 0,
    hasMore: data.hasMore ?? false,
  }
}

async function patchOrderStatus(input: {
  id: string
  status: OrderStatus
  token: string
  reason?: string
}) {
  const response = await fetch(`/api/admin/orders/${input.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({ status: input.status, reason: input.reason }),
  })
  const data = (await response.json()) as { ok?: boolean; error?: string }
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? 'Could not update order status.')
  }
  return data
}

// ── Status helpers ────────────────────────────────────────────────

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: 'status-badge--pending',
  confirmed: 'status-badge--confirmed',
  out_for_delivery: 'status-badge--out_for_delivery',
  delivered: 'status-badge--delivered',
  cancelled: 'status-badge--cancelled',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={11} />,
  confirmed: <CheckCheck size={11} />,
  out_for_delivery: <Truck size={11} />,
  delivered: <PackageCheck size={11} />,
  cancelled: <X size={11} />,
}

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const ACTION_CLASS: Record<string, string> = {
  confirmed: 'status-action-btn--confirm',
  out_for_delivery: 'status-action-btn--dispatch',
  delivered: 'status-action-btn--deliver',
  cancelled: 'status-action-btn--cancel',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  confirmed: <ArrowRight size={13} />,
  out_for_delivery: <Truck size={13} />,
  delivered: <PackageCheck size={13} />,
  cancelled: <X size={13} />,
}

// ── Order card ────────────────────────────────────────────────────

type OrderCardProps = {
  order: AdminOrder
  onStatusChange: (id: string, status: OrderStatus) => void
  updatingId: string | null
  justUpdatedId: string | null
  getIdToken: () => Promise<string | null>
  setMutationError: (msg: string) => void
}

function OrderCard({
  order,
  onStatusChange,
  updatingId,
  justUpdatedId,
}: OrderCardProps) {
  const { formatPrice } = useCurrency()
  const isUpdating = updatingId === order.id
  const isSuccess = justUpdatedId === order.id

  const nextStatuses = ORDER_STATUSES.filter((s) =>
    canTransitionOrderStatus(order.status, s),
  )

  return (
    <article
      className={[
        'admin-order-card reveal-in',
        isUpdating ? 'admin-order-card--updating' : '',
        isSuccess ? 'admin-order-card--success' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="admin-order-head">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="m-0 text-base font-semibold">#{order.orderNumber}</h2>
          <span
            className={`status-badge ${STATUS_BADGE_CLASS[order.status] ?? ''}`}
          >
            {STATUS_ICONS[order.status]}
            {formatStatus(order.status)}
          </span>
          {isUpdating ? (
            <Loader2 size={14} className="animate-spin text-(--ink-soft)" />
          ) : null}
        </div>
        <p className="m-0 text-xs text-(--ink-soft) whitespace-nowrap">
          {new Date(order.createdAt).toLocaleDateString('en-UG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          {' · '}
          {new Date(order.createdAt).toLocaleTimeString('en-UG', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="admin-order-meta">
        <p>
          <strong>Customer:</strong> {order.customerName}
        </p>
        <p>
          <strong>Phone:</strong> {order.phone}
        </p>
        <p>
          <strong>Location:</strong> {order.location}
        </p>
        <p>
          <strong>Items:</strong> {order.itemCount} &nbsp;·&nbsp;{' '}
          <strong>Total:</strong> {formatPrice(order.totalUgx)}
        </p>
      </div>

      <div className="admin-order-actions">
        {nextStatuses.length === 0 ? (
          <span className="text-sm text-(--ink-soft) italic">
            {order.status === 'delivered'
              ? 'Order complete'
              : 'Order cancelled'}
          </span>
        ) : (
          nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`status-action-btn ${ACTION_CLASS[status] ?? ''}`}
              disabled={isUpdating}
              onClick={() => onStatusChange(order.id, status)}
            >
              {ACTION_ICONS[status]}
              Mark {formatStatus(status)}
            </button>
          ))
        )}
      </div>
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  ...ORDER_STATUSES.map((s) => ({
    value: s,
    label: formatStatus(s),
  })),
]

function AdminOrdersPage() {
  const { user, loading, isAdmin, getIdToken } = useAuth()
  const navigate = useNavigate({ from: '/admin/orders' })
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [offset, setOffset] = useState(0)
  const [mutationError, setMutationError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [justUpdatedId, setJustUpdatedId] = useState<string | null>(null)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: '/auth/login', search: { redirectTo: '/admin/orders' } })
    }
  }, [loading, navigate, user])

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [])

  const ordersQuery = useQuery({
    enabled: Boolean(user && isAdmin),
    queryKey: ['admin-orders', filter, offset],
    queryFn: async () => {
      const token = await getIdToken()
      if (!token) throw new Error('Missing auth token.')
      return fetchOrders(filter, token, offset)
    },
  })

  const statusMutation = useMutation({
    mutationFn: patchOrderStatus,
    onSuccess: async (_, variables) => {
      setMutationError('')
      setUpdatingId(null)
      setJustUpdatedId(variables.id)
      if (successTimer.current) clearTimeout(successTimer.current)
      successTimer.current = setTimeout(() => setJustUpdatedId(null), 1800)
      await queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (error) => {
      setUpdatingId(null)
      const message = error instanceof Error ? error.message : 'Could not update status.'
      if (message.toLowerCase().includes('missing auth token')) {
        void navigate({ to: '/auth/login', search: { redirectTo: '/admin/orders' } })
        return
      }
      setMutationError(message)
      // clear after 5 s
      setTimeout(() => setMutationError(''), 5000)
    },
  })

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const token = await getIdToken()
    if (!token) {
      setMutationError('Missing auth token.')
      return
    }
    setUpdatingId(id)
    setMutationError('')
    statusMutation.mutate({ id, status, token })
  }

  const orders = useMemo(() => ordersQuery.data?.orders ?? [], [ordersQuery.data])
  const total = ordersQuery.data?.total ?? 0
  const hasMore = ordersQuery.data?.hasMore ?? false

  if (loading) {
    return (
      <main className="page-wrap px-4 pb-12 pt-8">
        <div className="cart-page-panel reveal-in flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Checking access…
        </div>
      </main>
    )
  }

  if (user && !isAdmin) {
    return (
      <main className="page-wrap px-4 pb-12 pt-8">
        <section className="cart-page-panel reveal-in">
          <p className="field-error">Your account is not allowed to access admin orders.</p>
          <Link to="/" className="btn-muted mt-3 inline-block no-underline">Back to Store</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Admin</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">Order Queue</h1>
        <p className="mt-3 max-w-2xl text-(--ink-soft)">
          Track COD orders and progress them through confirmation, dispatch, and delivery.
        </p>
      </section>

      <section className="admin-orders-page mt-6">
        <div className="admin-orders-toolbar reveal-in">
          <p className="m-0 text-sm text-(--ink-soft)">
            {total > 0 ? `${total} orders` : `${orders.length} orders`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--ink-soft)">Status</span>
            <Select
              value={filter}
              onValueChange={(v) => {
                setFilter(v as 'all' | OrderStatus)
                setOffset(0)
              }}
              options={FILTER_OPTIONS}
              aria-label="Filter by order status"
            />
          </div>
        </div>

        {mutationError ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            <X size={14} />
            {mutationError}
          </div>
        ) : null}

        {ordersQuery.isPending ? (
          <div className="cart-page-panel reveal-in flex items-center gap-2 mt-4">
            <Loader2 size={16} className="animate-spin" /> Loading orders…
          </div>
        ) : null}

        {ordersQuery.isError ? (
          <div className="cart-page-panel reveal-in mt-4">
            <p className="field-error m-0">
              {ordersQuery.error instanceof Error
                ? ordersQuery.error.message
                : 'Could not load orders.'}
            </p>
          </div>
        ) : null}

        {!ordersQuery.isPending && !ordersQuery.isError && orders.length === 0 ? (
          <div className="empty-state reveal-in mt-4">
            <h3>No orders found</h3>
            <p>Try another status filter or place a test order from checkout.</p>
          </div>
        ) : null}

        {(offset > 0 || hasMore) && !ordersQuery.isPending ? (
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              className="btn-muted inline-flex items-center gap-1.5"
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              disabled={offset === 0 || ordersQuery.isPending}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-sm text-(--ink-soft)">
              {offset + 1}–{Math.min(offset + orders.length, total)} of {total}
            </span>
            <button
              type="button"
              className="btn-muted inline-flex items-center gap-1.5"
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              disabled={!hasMore || ordersQuery.isPending}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        ) : null}

        <div className="admin-order-grid mt-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
              justUpdatedId={justUpdatedId}
              getIdToken={getIdToken}
              setMutationError={setMutationError}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
