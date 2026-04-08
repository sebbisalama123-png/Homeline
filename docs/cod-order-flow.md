# COD Order Flow (Uganda Furniture E-Commerce)

This document defines the end-to-end process for direct order placement with **Cash on Delivery (COD)**.

## 1. High-Level Customer + System Flow

```mermaid
flowchart TD
  A[Customer browses catalog] --> B[Adds products to cart]
  B --> C[Opens checkout page]
  C --> D[Fills delivery details]
  D --> E[Clicks Place Order COD]
  E --> F{Validation passes?}
  F -- No --> G[Show field errors]
  G --> D
  F -- Yes --> H[Create order in database]
  H --> I[Set status: pending]
  I --> J[Send admin notification]
  J --> K[Show customer success + order number]
  K --> L[Ops confirms order by phone]
  L --> M{Customer confirms?}
  M -- No --> N[Set status: cancelled]
  M -- Yes --> O[Set status: confirmed]
  O --> P[Pack and dispatch]
  P --> Q[Set status: out_for_delivery]
  Q --> R[Deliver + collect cash]
  R --> S[Set status: delivered]
```

## 2. Checkout Data Flow (Technical)

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (TanStack Start)
  participant API as Cloudflare API Route
  participant DB as D1 Database
  participant OPS as Admin/Ops

  U->>FE: Submit COD checkout form
  FE->>FE: Validate required fields
  FE->>API: POST /api/orders
  API->>API: Validate payload
  API->>DB: Insert order + order_items
  DB-->>API: order_id
  API->>OPS: Email/WhatsApp new order alert
  API-->>FE: 201 Created + order number
  FE-->>U: Success page / confirmation message
```

## 3. Required Checkout Fields

- Full name
- Phone number (Uganda format)
- Email (optional but recommended)
- District / area
- Exact delivery address + landmark
- Notes (optional)
- Cart items (slug, quantity, price snapshot)

## 4. Order Status Lifecycle

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> confirmed: Call/SMS confirmed
  pending --> cancelled: No response / rejected
  confirmed --> out_for_delivery: Rider assigned
  out_for_delivery --> delivered: Cash collected
  out_for_delivery --> cancelled: Failed delivery
```

## 5. Admin Operations Flow

1. New order notification received.
2. Call customer to verify location and availability.
3. Update status to `confirmed`.
4. Prepare and dispatch order.
5. Update status to `out_for_delivery`.
6. After payment, update to `delivered`.
7. If failed/rejected, set `cancelled` with reason.

## 6. MVP Guardrails for COD

- Add basic anti-fraud checks (duplicate phone + repeated failed orders).
- Require phone confirmation before dispatch.
- Store a price snapshot per item at order time.
- Keep inventory soft-check to avoid overselling.

## 7. Suggested API Endpoints

- `POST /api/orders` - create COD order
- `GET /api/orders/:id` - customer/admin order lookup
- `PATCH /api/orders/:id/status` - admin status update
- `GET /api/admin/orders?status=pending` - admin queue

## 8. Suggested Minimal Tables

- `orders`
  - id, order_number, customer_name, phone, email, district, address, notes, payment_method, status, subtotal_ugx, delivery_fee_ugx, total_ugx, created_at
- `order_items`
  - id, order_id, product_slug, product_name, unit_price_ugx, quantity, line_total_ugx
- `order_status_history`
  - id, order_id, old_status, new_status, changed_by, changed_at, reason

## 9. Definition of Done (MVP)

- Customer can place COD order end-to-end.
- Order is persisted in DB.
- Admin is notified instantly.
- Admin can update statuses through delivery completion.
- Customer receives order reference number.
