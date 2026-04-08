import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDatabase } from '../lib/server/db'
import {
  isVerifiedEmail,
  verifyFirebaseTokenFromRequest,
} from '../lib/server/firebaseAuth'
import { users } from '../lib/server/schema'

export const Route = createFileRoute('/api/auth/sync')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
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

        const db = getDatabase(context)
        if (!db) {
          return json({ error: 'Database not configured.' }, { status: 500 })
        }

        const uid = authResult.payload.sub
        const email =
          typeof authResult.payload.email === 'string'
            ? authResult.payload.email
            : null
        const displayName =
          typeof authResult.payload.name === 'string'
            ? authResult.payload.name
            : null

        if (!uid || !email) {
          return json({ error: 'No uid or email in token.' }, { status: 400 })
        }

        try {
          const now = new Date()
          await db
            .insert(users)
            .values({
              id: uid,
              email,
              displayName,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                email,
                displayName,
                updatedAt: now,
              },
            })

          return json({ ok: true })
        } catch (err) {
          console.error('[POST /api/auth/sync]', err)
          return json({ error: 'Failed to sync user.' }, { status: 500 })
        }
      },
    },
  },
})
