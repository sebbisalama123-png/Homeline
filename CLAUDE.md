# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start storefront at http://localhost:3000
npm run build        # Vite build + tsc --noEmit (must pass before any task is "done")
npm test             # Run all Vitest tests (31 tests across 3 files)
npm run deploy       # Build then wrangler deploy to Cloudflare Workers
npm run db:push      # Push Drizzle schema to Neon (run against dev and prod separately)
npm run lint         # ESLint
npm run check        # Prettier write + ESLint fix

# Sanity Studio (separate process, separate deps)
cd sanity-studio && npm run dev   # Studio at http://localhost:3333

# Run a single test file
npx vitest run src/lib/currency.test.ts
```

## Architecture Overview

### Framework & Routing

TanStack Start with file-based routing. Every file under `src/routes/` becomes a route. Route files export a `Route = createFileRoute(...)` constant — loaders, head metadata, and the component all live in that same file.

- `__root.tsx` — HTML shell, global providers (QueryClient, Auth, Currency, Cart), theme script
- `api.*.ts` files — server-only API handlers (no component); use `server: { handlers: { GET/POST } }`
- Naming convention: `api.admin.orders.$id.status.ts` → `/api/admin/orders/:id/status`

### Data Flow: Products

Products have two sources, unified behind a single interface:

1. **Sanity CMS** — used when `VITE_SANITY_PROJECT_ID` is set (`isSanityConfigured()` returns `true`)
2. **Local fallback** — `src/data/catalog.ts` static array, used when Sanity is not configured

All callers use `src/lib/sanity/queries.ts` (`getAllProducts`, `getProductBySlug`, etc.) which transparently switches. The shared type is `SanityProduct` from `src/lib/sanity/types.ts`. The local `Product` type and `SanityProduct` are structurally compatible; `CartProvider` uses the `AddableProduct` interface that both satisfy.

### Data Flow: Orders (Server)

```
Browser → POST /api/orders → Zod validation → calculateDeliveryFee() → Drizzle insert → Neon
                                                                          ↓
                                                            orderStatusHistory insert
```

Database schema lives in `src/lib/server/schema.ts` (tables: `orders`, `order_items`, `order_status_history`, `users`). Access via `getDatabase(context)` from `src/lib/server/db.ts`, which walks the TanStack/Cloudflare context tree to find `DATABASE_URL`.

Status transitions are enforced by `canTransitionOrderStatus()` in `src/lib/validation/order.ts` — do not bypass this.

### Authentication Pattern

Firebase Auth on the client (`src/lib/firebase/client.ts`), verified server-side with `jose` JWKS verification (`src/lib/server/firebaseAuth.ts`).

Every protected API route must:

1. Call `verifyFirebaseTokenFromRequest(request, context)` — returns `{ ok, payload }`
2. Check `isVerifiedEmail(payload)` for email-verified gate
3. Check `isAdminEmail(context, email)` for admin-only routes

The `AuthProvider` automatically calls `POST /api/auth/sync` after every verified login to upsert the user into the `users` table.

Admin access is controlled by the `ADMIN_EMAILS` env var (comma-separated). The client reads `VITE_ADMIN_EMAILS`; the server reads `ADMIN_EMAILS`.

### Currency

All prices are stored and passed as numeric UGX. Never store formatted strings. Conversion happens at display time via `convertFromUGX()` and `formatMoney()` from `src/lib/currency.ts`. The `CurrencyProvider` wraps this; components call `useCurrency().formatPrice(ugxAmount)`.

### UI Component System

- **Icons:** `lucide-react` only — already installed, do not add other icon libraries.
- **Select dropdowns:** use `src/components/ui/Select.tsx` (built on `@radix-ui/react-select`) everywhere — no native `<select>` elements in the UI. The `cn()` helper is at `src/components/ui/cn.ts`.
- **Styling:** single file `src/styles.css`. Custom classes use the earthy palette (`--ink`, `--clay`, `--paper`, `--mist`, etc.) and Cormorant Garamond / Outfit type pairing. New Radix/shadcn component styles use `.ht-*` prefix and live in `src/styles.css`.

### Delivery Fee

Calculated server-side in `src/lib/server/deliveryFee.ts`. Kampala-area orders ≥ UGX 1,500,000 = free; otherwise UGX 50,000. Upcountry = UGX 150,000 always. The server is authoritative; client-side estimate is display-only.

## What's Left to Build

1. **Order confirmation email** — `POST /api/orders` should call Resend after a successful insert. Needs `RESEND_API_KEY` env var. User must sign up at resend.com.
2. **Sanity edge caching** — wrap Sanity fetches in route loaders with Cloudflare `caches.default` for sub-millisecond repeated reads.

## Key Constraints

- `tsconfig.json` has `noUnusedLocals` and `noUnusedParameters` — the build fails on dead imports/variables.
- `sanity-studio/` is excluded from the main `tsconfig.json` — it has its own TS config.
- The `#/*` path alias maps to `src/*` (configured in `package.json` `imports` field and `tsconfig.json`).
- Cloudflare Workers does not have Node.js `process.env` at runtime — all secrets must be `wrangler secret put` values accessed through the request context. The `getDatabase()` and `getEnvValue()` helpers handle this context traversal.
- TanStack Router async loaders require an explicit `Promise<T>` return type annotation or `useLoaderData()` types as `undefined`. Always cast: `Route.useLoaderData() as T`.
- The WhatsApp number `https://wa.me/256704579980` is a placeholder in `src/routes/about.tsx` and `src/routes/products.$slug.tsx` — replace with the real number when provided.
