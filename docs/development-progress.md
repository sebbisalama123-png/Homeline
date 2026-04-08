# Development Progress Tracker

This file tracks implementation progress for the Uganda furniture e-commerce app.
It is updated continuously during development.

## Project Snapshot

- Project: Uganda Furniture E-commerce
- Stack: TanStack Start, React 19, TypeScript, Tailwind CSS v4, Vite, Cloudflare
- Data/validation layer: Drizzle ORM + Zod + TanStack React Query
- Commerce mode: Cash on Delivery (COD)
- Currency model: UGX as canonical base price
- Current phase: Frontend completed core flows, backend wiring pending

## Status Legend

- Not Started
- In Progress
- Done
- Blocked

## Milestones

| ID  | Milestone                        | Status      | Notes                                                            |
| --- | -------------------------------- | ----------- | ---------------------------------------------------------------- |
| M1  | Frontend shell and visual system | Done        | Header, footer, visual language, responsive baseline             |
| M2  | Product browsing flows           | Done        | Home, shop, category routes, product detail                      |
| M3  | Cart and COD checkout UI         | Done        | Cart drawer and cart page with validation                        |
| M4  | UGX-first currency architecture  | Done        | Reusable currency provider and conversion-ready formatting       |
| M5  | Frontend UX hardening            | Done        | Filters, skeleton loading, drawers, lightbox, accessibility pass |
| M6  | Order persistence backend        | In Progress | Rewritten with Drizzle ORM + Zod + React Query mutation flow     |
| M7  | Admin order workflow             | In Progress | API done + frontend queue/status actions added                   |
| M8  | CMS integration                  | Not Started | Replace local catalog with CMS content                           |
| M9  | Auth and role guards             | In Progress | Firebase Auth wired (Google + email/password) + admin gating     |
| M10 | Production hardening and QA      | In Progress | Build passes, tests/monitoring/SEO still pending                 |

## Current Sprint Focus

1. Implement order persistence backend for COD flow.
2. Add order status transition support.
3. Keep frontend behavior stable while wiring backend.

## Next Actions

1. Set Neon `DATABASE_URL` in local `.env`.
2. Set `DATABASE_URL` as Cloudflare secret for deployment.
3. Run first Postgres migration with Drizzle.
4. Finish Firebase env/secrets wiring and admin token checks in deployment.
5. Add smoke tests for cart totals, currency conversion, and checkout submit.
6. Polish order confirmation route (support phone lookup fallback).

## Your Part (Needed Now)

1. Put your Neon connection string in `.env`:
   - `DATABASE_URL=postgres://...`
2. Set Cloudflare secret:
   - `npx wrangler secret put DATABASE_URL`
3. Generate migration SQL:
   - `npm run db:generate`
4. Apply migrations:
   - `npm run db:migrate`
5. Share back any command output errors so I can adjust quickly.

## Risks and Watchouts

- Do not break mobile drawer/cart/filter flows while adding backend wiring.
- Do not change price storage from numeric UGX base values.
- Do not skip server-side validation for checkout payloads.
- Do not merge backend schema changes without migration notes.

## Change Log

### 2026-04-02

- Created progress tracker file.
- Initialized milestones and current project status.
- Recorded next execution priorities for backend/COD completion.
- Added COD D1 migration (`0001_cod_orders.sql`).
- Added backend order creation endpoint (`POST /api/orders`).
- Wired cart checkout submit to live API and success/error handling.
- Updated M6 status to In Progress and added required setup steps for D1 binding.
- Installed and integrated Drizzle ORM, Drizzle Kit, Zod, and TanStack React Query.
- Rewrote order API using shared Zod schemas + Drizzle inserts.
- Rewrote cart submit flow to React Query mutation + shared schema validation.
- Added admin queue endpoint (`GET /api/admin/orders`).
- Added admin status update endpoint (`PATCH /api/admin/orders/:id/status`).
- Added strict status transition rules in shared validation.
- Added admin frontend route for order queue + status actions (`/admin/orders`).
- Added customer order confirmation route (`/order-success`) and checkout redirect.
- Switched backend persistence from D1 to Neon Postgres (`DATABASE_URL`).
- Updated Drizzle schema/config/scripts for PostgreSQL migration flow.
- Added Firebase auth provider and auth routes (`/auth/login`, `/auth/signup`).
- Added frontend admin route guard and protected admin APIs with Firebase ID token verification.

## How This File Is Maintained

- Update milestone statuses at the end of each implementation batch.
- Append a dated changelog entry after significant changes.
- Keep notes concise and execution-focused.
