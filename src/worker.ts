/**
 * Custom Cloudflare Workers entry point.
 *
 * TanStack Start's default server-entry passes CF `env` as `requestOpts` but
 * only reads `requestOpts?.context` into the handler — so bindings are
 * invisible to the context walkers in db.ts / firebaseAuth.ts.
 *
 * We wrap `env` inside `{ env }` so `getEnvValue(context, key)` finds:
 *   context.env?.['DATABASE_URL']  ✓
 */
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

type CfEnv = Record<string, string>

const handler = createStartHandler(defaultStreamHandler)

export default {
  async fetch(
    request: Request,
    env: CfEnv,
    _ctx: unknown,
  ): Promise<Response> {
    return handler(request, {
      context: { env } as Record<string, unknown>,
    }) as Promise<Response>
  },
}
