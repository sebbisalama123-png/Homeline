import { Link, createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useCart } from '../components/CartProvider'
import { useCurrency } from '../components/CurrencyProvider'
import {
  createOrderInputSchema,
  customerDetailsSchema,
  type CreateOrderInput,
} from '../lib/validation/order'

function maskUgandaPhone(value: string) {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('256')) {
    digits = digits.slice(3)
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  digits = digits.slice(0, 9)

  let masked = '+256'

  if (digits.length > 0) {
    masked += ` ${digits.slice(0, 3)}`
  }

  if (digits.length > 3) {
    masked += ` ${digits.slice(3, 6)}`
  }

  if (digits.length > 6) {
    masked += ` ${digits.slice(6, 9)}`
  }

  return masked
}

type OrderSubmitResponse = {
  ok?: boolean
  error?: string
  orderNumber?: string
}

async function submitOrder(
  payload: CreateOrderInput,
): Promise<OrderSubmitResponse> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as OrderSubmitResponse

  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? 'Could not place order. Please try again.')
  }

  return result
}

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { formatPrice } = useCurrency()
  const { items, subtotal, increment, decrement, remove, clear } = useCart()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate({ from: '/cart' })

  const placeOrderMutation = useMutation({
    mutationFn: submitOrder,
  })

  const canSubmit = items.length > 0

  const validate = () => {
    const parsed = customerDetailsSchema.safeParse(form)
    if (parsed.success) {
      return {}
    }

    return parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const field = issue.path[0]
      if (typeof field === 'string' && !acc[field]) {
        acc[field] = issue.message
      }
      return acc
    }, {})
  }

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = event.target
    const value =
      name === 'phone'
        ? maskUgandaPhone(event.target.value)
        : event.target.value
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || placeOrderMutation.isPending) return

    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length === 0) {
      try {
        const payload: CreateOrderInput = createOrderInputSchema.parse({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          location: form.location,
          notes: form.notes,
          items: items.map((item) => ({
            slug: item.slug,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        })

        const result = await placeOrderMutation.mutateAsync(payload)
        const nextOrderNumber = result.orderNumber ?? ''
        clear()
        void navigate({
          to: '/order-success',
          search: nextOrderNumber ? { orderNumber: nextOrderNumber } : {},
        })
      } catch (error) {
        console.error('Order submission error:', error)
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Network error. Please try again.',
        )
      }
    }
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">
          Cash on Delivery Checkout
        </h1>
        <p className="mt-3 max-w-2xl text-(--ink-soft)">
          Place your order now and pay on delivery. Our Uganda team will call to
          confirm location and dispatch.
        </p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_370px]">
        <div className="cart-page-panel reveal-in">
          <div className="cart-page-head">
            <h2>Your items ({items.length})</h2>
            {items.length > 0 ? (
              <button type="button" className="section-link" onClick={clear}>
                Clear cart
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is currently empty.</p>
              <Link to="/shop" className="btn-primary no-underline">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-list mt-4">
              {items.map((item) => (
                <article key={item.slug} className="cart-item cart-item--wide">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <div>
                    <p className="m-0 font-semibold">{item.name}</p>
                    <p className="m-0 mt-1 text-sm text-(--ink-soft)">
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="cart-qty mt-2">
                      <button
                        type="button"
                        onClick={() => decrement(item.slug)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increment(item.slug)}
                      >
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
                  <p className="cart-item-total">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="cart-page-panel reveal-in">
          <h2 className="m-0 text-xl">Customer details</h2>
          <form
            className="inquiry-form mt-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <label>
              Full name
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'is-invalid' : ''}
                placeholder="Jane Nansubuga"
              />
              {errors.fullName ? (
                <span className="field-error">{errors.fullName}</span>
              ) : null}
            </label>
            <label>
              Phone number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? 'is-invalid' : ''}
                placeholder="+256 700 123 456"
                inputMode="numeric"
              />
              {errors.phone ? (
                <span className="field-error">{errors.phone}</span>
              ) : null}
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'is-invalid' : ''}
                placeholder="you@example.com"
              />
              {errors.email ? (
                <span className="field-error">{errors.email}</span>
              ) : null}
            </label>
            <label>
              Delivery location
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className={errors.location ? 'is-invalid' : ''}
                placeholder="Kampala, Ntinda"
              />
              {errors.location ? (
                <span className="field-error">{errors.location}</span>
              ) : null}
            </label>
            <label>
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Preferred delivery date, floor access, color preference..."
              />
            </label>

            <div className="cart-summary mt-4">
              <p>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </p>
              <p>
                <span>Delivery</span>
                <strong>
                  {form.location.toLowerCase().includes('kampala') ||
                  form.location.toLowerCase().includes('ntinda') ||
                  form.location.toLowerCase().includes('wakiso') ||
                  form.location.toLowerCase().includes('entebbe')
                    ? subtotal >= 1_500_000
                      ? 'Free'
                      : 'UGX 50,000'
                    : form.location.trim()
                      ? 'UGX 150,000'
                      : 'Enter location'}
                </strong>
              </p>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={!canSubmit || placeOrderMutation.isPending}
              >
                {placeOrderMutation.isPending
                  ? 'Placing Order...'
                  : 'Place Order (COD)'}
              </button>
              <p className="text-xs text-(--ink-soft)">
                Payment is collected on delivery after confirmation by our sales
                team.
              </p>
            </div>
          </form>

          {submitError ? (
            <p className="field-error mt-3">{submitError}</p>
          ) : null}
          {hasErrors ? (
            <p className="field-error mt-3">
              Please fix highlighted fields before submitting.
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
