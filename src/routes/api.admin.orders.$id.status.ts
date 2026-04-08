import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { json } from '@tanstack/react-start'
import { getDatabase } from '../lib/server/db'
import {
  isAdminEmail,
  isVerifiedEmail,
  verifyFirebaseTokenFromRequest,
} from '../lib/server/firebaseAuth'
import { orderStatusHistory, orders } from '../lib/server/schema'
import {
  canTransitionOrderStatus,
  updateOrderStatusInputSchema,
} from '../lib/validation/order'

export const Route = createFileRoute('/api/admin/orders/$id/status')({
  server: {
    handlers: {
      PATCH: async ({ params, request, context }) => {
        const authResult = await verifyFirebaseTokenFromRequest(
          request,
          context,
        )
        if (!authResult.ok) {
          return json(
            { error: authResult.error },
            { status: authResult.status },
          )
        }

        const email =
          typeof authResult.payload.email === 'string'
            ? authResult.payload.email
            : undefined

        if (!isVerifiedEmail(authResult.payload)) {
          return json(
            { error: 'Verify your email before accessing admin APIs.' },
            { status: 403 },
          )
        }

        if (!isAdminEmail(context, email)) {
          return json({ error: 'Admin access denied.' }, { status: 403 })
        }

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

        const payloadRaw = await request.json()
        const payloadParsed = updateOrderStatusInputSchema.safeParse(payloadRaw)

        if (!payloadParsed.success) {
          return json(
            {
              error:
                payloadParsed.error.issues[0]?.message ??
                'Invalid status update payload.',
            },
            { status: 400 },
          )
        }

        const existing = await db
          .select({ id: orders.id, status: orders.status })
          .from(orders)
          .where(eq(orders.id, params.id))
          .limit(1)

        if (existing.length === 0) {
          return json({ error: 'Order not found.' }, { status: 404 })
        }

        const current = existing[0]
        const nextStatus = payloadParsed.data.status

        if (!canTransitionOrderStatus(current.status, nextStatus)) {
          return json(
            {
              error: `Invalid status transition: ${current.status} -> ${nextStatus}`,
            },
            { status: 400 },
          )
        }

        const now = new Date().toISOString()

        try {
          await db
            .update(orders)
            .set({
              status: nextStatus,
              updatedAt: now,
            })
            .where(eq(orders.id, params.id))

          await db.insert(orderStatusHistory).values({
            id: crypto.randomUUID(),
            orderId: params.id,
            oldStatus: current.status,
            newStatus: nextStatus,
            changedBy: 'admin',
            reason: payloadParsed.data.reason?.trim() || null,
            changedAt: now,
          })

          return json({ ok: true, from: current.status, to: nextStatus })
        } catch (err) {
          console.error(
            '[PATCH /api/admin/orders/:id/status] Unhandled error',
            err,
          )
          return json(
            { error: 'An unexpected error occurred.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
