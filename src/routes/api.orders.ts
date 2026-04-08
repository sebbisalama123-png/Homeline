import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { json } from '@tanstack/react-start'
import { getDatabase } from '../lib/server/db'
import { calculateDeliveryFee } from '../lib/server/deliveryFee'
import { sendOrderConfirmationEmail } from '../lib/server/email'
import { orderItems, orders, orderStatusHistory } from '../lib/server/schema'
import { createOrderInputSchema } from '../lib/validation/order'

function createOrderNumber(now: Date): string {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `UG-${y}${m}${d}-${random}`
}

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const db = getDatabase(context)
        if (!db) {
          return json(
            {
              error:
                'Database not configured. Set DATABASE_URL in environment.',
            },
            { status: 500 },
          )
        }

        const url = new URL(request.url)
        const orderNumber = url.searchParams.get('orderNumber')?.trim()

        if (!orderNumber) {
          return json({ error: 'orderNumber is required.' }, { status: 400 })
        }

        const orderRows = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            customerName: orders.customerName,
            phone: orders.phone,
            location: orders.location,
            status: orders.status,
            subtotalUgx: orders.subtotalUgx,
            totalUgx: orders.totalUgx,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(eq(orders.orderNumber, orderNumber))
          .limit(1)

        if (orderRows.length === 0) {
          return json({ error: 'Order not found.' }, { status: 404 })
        }

        const order = orderRows[0]

        const items = await db
          .select({
            productSlug: orderItems.productSlug,
            productName: orderItems.productName,
            unitPriceUgx: orderItems.unitPriceUgx,
            quantity: orderItems.quantity,
            lineTotalUgx: orderItems.lineTotalUgx,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id))

        return json({ ok: true, order: { ...order, items } })
      },

      POST: async ({ request, context }) => {
        const db = getDatabase(context)
        if (!db) {
          return json(
            {
              error:
                'Database not configured. Set DATABASE_URL in environment.',
            },
            { status: 500 },
          )
        }

        const rawPayload = await request.json()
        const parsed = createOrderInputSchema.safeParse(rawPayload)

        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0]
          return json(
            { error: firstIssue?.message ?? 'Invalid order payload.' },
            { status: 400 },
          )
        }

        const payload = parsed.data

        try {
          const now = new Date()
          const orderId = crypto.randomUUID()
          const orderNumber = createOrderNumber(now)
          const createdAt = now.toISOString()

          const subtotal = payload.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0,
          )
          const deliveryFee = calculateDeliveryFee(payload.location, subtotal)
          const total = subtotal + deliveryFee

          await db.insert(orders).values({
            id: orderId,
            orderNumber,
            customerName: payload.fullName.trim(),
            phone: payload.phone.trim(),
            email: payload.email.trim(),
            location: payload.location.trim(),
            notes: payload.notes?.trim() || null,
            paymentMethod: 'COD',
            status: 'pending',
            subtotalUgx: subtotal,
            deliveryFeeUgx: deliveryFee,
            totalUgx: total,
            createdAt,
            updatedAt: createdAt,
          })

          await db.insert(orderItems).values(
            payload.items.map((item) => ({
              id: crypto.randomUUID(),
              orderId,
              productSlug: item.slug,
              productName: item.name,
              unitPriceUgx: item.unitPrice,
              quantity: item.quantity,
              lineTotalUgx: item.unitPrice * item.quantity,
              createdAt,
            })),
          )

          await db.insert(orderStatusHistory).values({
            id: crypto.randomUUID(),
            orderId,
            oldStatus: null,
            newStatus: 'pending',
            changedBy: 'system',
            reason: null,
            changedAt: createdAt,
          })

          // Send confirmation email — fire-and-forget, never block the response
          void sendOrderConfirmationEmail(context, {
            to: payload.email.trim(),
            customerName: payload.fullName.trim(),
            orderNumber,
            items: payload.items.map((item) => ({
              productName: item.name,
              quantity: item.quantity,
              unitPriceUgx: item.unitPrice,
              lineTotalUgx: item.unitPrice * item.quantity,
            })),
            subtotalUgx: subtotal,
            deliveryFeeUgx: deliveryFee,
            totalUgx: total,
            location: payload.location.trim(),
          })

          return json({ ok: true, orderNumber }, { status: 201 })
        } catch (err) {
          console.error('[POST /api/orders] Unhandled error', err)
          return json(
            { error: 'An unexpected error occurred.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
