import { createFileRoute } from '@tanstack/react-router'
import { desc, eq, sql } from 'drizzle-orm'
import { json } from '@tanstack/react-start'
import { getDatabase } from '../lib/server/db'
import {
  isAdminEmail,
  isVerifiedEmail,
  verifyFirebaseTokenFromRequest,
} from '../lib/server/firebaseAuth'
import { orderItems, orders } from '../lib/server/schema'
import { orderStatusSchema } from '../lib/validation/order'

export const Route = createFileRoute('/api/admin/orders')({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
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

        try {
          const url = new URL(request.url)
          const statusParam = url.searchParams.get('status')
          const limit = Math.min(
            Number(url.searchParams.get('limit') ?? '20'),
            100,
          )
          const offset = Math.max(
            Number(url.searchParams.get('offset') ?? '0'),
            0,
          )

          const whereStatus = orderStatusSchema.safeParse(statusParam)

          const baseQuery = whereStatus.success
            ? db
                .select({
                  id: orders.id,
                  orderNumber: orders.orderNumber,
                  customerName: orders.customerName,
                  phone: orders.phone,
                  location: orders.location,
                  status: orders.status,
                  totalUgx: orders.totalUgx,
                  createdAt: orders.createdAt,
                })
                .from(orders)
                .where(eq(orders.status, whereStatus.data))
            : db
                .select({
                  id: orders.id,
                  orderNumber: orders.orderNumber,
                  customerName: orders.customerName,
                  phone: orders.phone,
                  location: orders.location,
                  status: orders.status,
                  totalUgx: orders.totalUgx,
                  createdAt: orders.createdAt,
                })
                .from(orders)

          const [rows, countRows] = await Promise.all([
            baseQuery
              .orderBy(desc(orders.createdAt))
              .limit(limit)
              .offset(offset),
            whereStatus.success
              ? db
                  .select({ total: sql<number>`count(*)` })
                  .from(orders)
                  .where(eq(orders.status, whereStatus.data))
              : db.select({ total: sql<number>`count(*)` }).from(orders),
          ])

          const total = Number(countRows[0]?.total ?? 0)

          const withItemCounts = await Promise.all(
            rows.map(async (row) => {
              const items = await db
                .select({ quantity: orderItems.quantity })
                .from(orderItems)
                .where(eq(orderItems.orderId, row.id))

              const itemCount = items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              )

              return { ...row, itemCount }
            }),
          )

          return json({
            ok: true,
            orders: withItemCounts,
            total,
            limit,
            offset,
            hasMore: offset + rows.length < total,
          })
        } catch (err) {
          console.error('[GET /api/admin/orders] Unhandled error', err)
          return json(
            { error: 'An unexpected error occurred.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
