# E-commerce App Build Instructions (Internal)

Use this file as the default implementation guide for this repository.

## 1. Product Goal

Build a Uganda-focused furniture e-commerce storefront with:

- category browsing
- product detail pages
- cart and COD checkout flow
- UGX-first currency handling
- production deployment on Cloudflare

Current phase focus: frontend-first with progressive backend wiring.

## 2. Stack (Source of Truth)

- Framework: TanStack Start + TanStack Router (file-based routes)
- UI: React 19 + TypeScript (strict mode)
- Styling: Tailwind CSS v4 + custom CSS in `src/styles.css`
- Client data layer: TanStack React Query
- Validation: Zod shared schemas
- ORM: Drizzle ORM + Drizzle Kit
- Build: Vite
- Deploy target: Cloudflare (Wrangler)
- Testing: Vitest + Testing Library
- Lint/format: ESLint + Prettier

## 3. TypeScript and Imports

- TS is strict; keep `noUnusedLocals` and `noUnusedParameters` clean.
- Use path aliases from `tsconfig.json`:
  - `#/* -> src/*`
  - `@/* -> src/*`
- Keep route search params optional unless truly required.
- Keep prices numeric in data models (no hardcoded currency strings).

## 4. Styling and UX Rules

- Preserve the existing visual language in `src/styles.css`:
  - earthy palette
  - expressive serif/sans typography combo
  - soft gradients and layered backgrounds
- Reuse existing utility classes/components before adding new patterns.
- Maintain mobile-first behavior for drawer/menu/cart/filter interactions.
- Keep accessibility baseline on interactive UI:
  - keyboard access
  - focus visibility
  - aria labels for dialog-like surfaces

## 5. Domain Rules (E-commerce)

- Canonical product price is UGX.
- Currency switcher must convert from UGX base, not only relabel symbols.
- Cart and totals must use shared currency formatting utilities.
- COD is the active checkout mode for MVP.
- Do not remove COD flow while adding later payment options.

## 6. Existing Core Frontend Surface

- Global shell: header, nav, drawers, footer
- Pages: home, shop, category shop, product detail, cart
- Shared state: cart provider, currency provider
- Product source: local catalog data in `src/data/catalog.ts`

## 7. Backend and Data Direction (Next)

Preferred fastest path:

1. CMS for catalog/content (Sanity)
2. Neon Postgres for orders/users/auth data
3. API routes/server functions for order creation + status updates using Drizzle + Zod
4. Firebase Auth for protected customer/admin pages (Google + email/password)

## 7.1 Backend Implementation Standard

- Put database schema in `src/lib/server/schema.ts`.
- Access Neon through `src/lib/server/db.ts` using `DATABASE_URL`.
- Validate request payloads with shared Zod schemas from `src/lib/validation/*`.
- Keep API handlers thin: parse -> validate -> persist -> return typed response.
- Use React Query for client writes/reads (`useMutation`, `useQuery`) instead of ad-hoc fetch state.

## 8. Definition of Done (MVP)

A change is not done until:

1. `npm run build` passes.
2. Core mobile flows are intact (menu/search/cart/filter/product CTA).
3. UGX conversion/formatting remains correct across product list, PDP, and cart.
4. No regression in route navigation or category filtering.
5. Any new form has client-side validation and clear success/error UI.

## 9. Priority Work Remaining

1. Persist orders to backend (replace frontend-only submission).
2. Admin order queue/status update workflow.
3. Real CMS product/content integration.
4. Auth + role guards for admin/customer areas.
5. SEO metadata per shop/category/product route.
6. Tests for cart totals, currency conversion, and checkout validation.

## 10. Working Conventions

- Keep patches minimal and targeted.
- Avoid broad CSS rewrites.
- Prefer extending existing components over introducing duplicates.
- If behavior changes, verify with a production build before finalizing.

## 11. What To Avoid (Scalability + Maintainability)

### Architecture and Data

- Do not hardcode product/catalog content into route files once CMS is introduced.
- Do not store formatted currency strings in data models; always store numeric UGX base values.
- Do not couple UI components directly to backend response shapes; map responses to typed app models.
- Do not skip status history for orders; track transitions (`pending`, `confirmed`, `out_for_delivery`, `delivered`, `cancelled`).
- Do not keep critical business logic only in the client (totals, delivery fee, status permissions).

### TypeScript and Code Quality

- Do not disable strict TypeScript flags to make builds pass.
- Do not use `any` for domain entities (product, order, user, cart item) without a clear boundary reason.
- Do not ignore unused code warnings; remove dead state, props, and imports quickly.
- Do not duplicate utility logic (price math, formatting, slug helpers, validation).
- Do not introduce deeply nested component state for cross-page concerns; lift shared state into providers/hooks.

### Frontend UX and Styling

- Do not add one-off visual styles inline when an existing class/token pattern already exists.
- Do not break mobile drawer/cart/filter flows while shipping desktop changes.
- Do not remove keyboard accessibility from dialogs, drawers, and filters.
- Do not mix multiple visual systems; keep typography, spacing, and color usage consistent with `src/styles.css`.
- Do not replace reusable components with near-duplicates; extend existing components first.

### API, Security, and Auth

- Do not expose secrets in client-side code or committed files.
- Do not trust client payloads; validate all order/auth inputs server-side.
- Do not leave admin routes unguarded; enforce role checks in server handlers.
- Do not ship auth without secure session handling (httpOnly cookies, expiry, rotation strategy).
- Do not allow unrestricted status updates; enforce allowed status transition rules.

### Performance and Operations

- Do not fetch large unpaginated product sets on every request.
- Do not skip caching strategy for catalog/content reads on Cloudflare.
- Do not block page rendering with heavy, unoptimized images.
- Do not ship without error logging/monitoring for API failures and order creation failures.
- Do not rely only on manual QA; keep smoke tests for checkout, cart totals, and currency conversion.

### Delivery Process

- Do not merge large mixed-purpose changes; keep PRs/task patches narrow.
- Do not skip `npm run build` before finalizing work.
- Do not deploy schema-breaking backend changes without migration notes.
- Do not defer data validation until production; validate at form layer and API layer.
- Do not leave important product decisions undocumented; update this file and relevant docs as decisions change.
