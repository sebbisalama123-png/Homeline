import { createFileRoute } from '@tanstack/react-router'
import { desc, eq, inArray } from 'drizzle-orm'
import { json } from '@tanstack/react-start'
import { getDatabase } from '../lib/server/db'
import {
  isVerifiedEmail,
  verifyFirebaseTokenFromRequest,
} from '../lib/server/firebaseAuth'
import { orderItems, orders } from '../lib/server/schema'

export const Route = createFileRoute('/api/account/orders')({
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

        if (!isVerifiedEmail(authResult.payload)) {
          return json({ error: 'Email not verified.' }, { status: 403 })
        }

        const email =
          typeof authResult.payload.email === 'string'
            ? authResult.payload.email
            : null

        if (!email) {
          return json({ error: 'No email in token.' }, { status: 400 })
        }

        const db = getDatabase(context)
        if (!db) {
          return json({ error: 'Database not configured.' }, { status: 500 })
        }

        try {
          const rows = await db
            .select()
            .from(orders)
            .where(eq(orders.email, email))
            .orderBy(desc(orders.createdAt))

          const orderIds = rows.map((o) => o.id)
          const allItems =
            orderIds.length > 0
              ? await db
                  .select()
                  .from(orderItems)
                  .where(inArray(orderItems.orderId, orderIds))
              : []

          // Group items by order id
          const itemsByOrder: Record<string, typeof allItems> = {}
          for (const item of allItems) {
            if (!itemsByOrder[item.orderId]) {
              itemsByOrder[item.orderId] = []
            }
            itemsByOrder[item.orderId].push(item)
          }

          const result = rows.map((order) => ({
            ...order,
            items: itemsByOrder[order.id] ?? [],
          }))

          return json(result)
        } catch (err) {
          console.error('[GET /api/account/orders]', err)
          return json({ error: 'Failed to load orders.' }, { status: 500 })
        }
      },
    },
  },
})
