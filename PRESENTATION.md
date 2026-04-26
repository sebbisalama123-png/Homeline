# Homeline — E-Commerce Project

**Live Site (Main App):** [homeline.sebbisalama123.workers.dev](https://homeline.sebbisalama123.workers.dev/)

**Sanity Studio (Product Management):** [Open Studio](https://www.sanity.io/@oJV5BwYWE/studio/dny1r66259w86i1oc8bmgsd4/homeline-furniture/structure)

---

## What Is Homeline?

Homeline is a **furniture e-commerce platform** built for the Ugandan market. Customers can browse furniture, place orders, and have items delivered — all online. It is a complete, production-ready web application, not a demo or prototype. It is live on the internet right now.

---

## The Problem It Solves

Most furniture businesses in Uganda still rely on phone calls, walk-ins, or WhatsApp to sell. Homeline gives such a business a real online presence — a professional store where products are listed with images and prices, orders are tracked in a database, and the business owner can manage everything without touching code.

---

## What a Customer Can Do

- Browse all furniture products with photos and descriptions
- Add items to a shopping cart
- Create an account and log in
- Choose a delivery location (Kampala or upcountry)
- See the delivery fee calculated automatically
- See prices in their preferred currency (UGX, USD, EUR, GBP, and more)
- Place an order — which is saved permanently to a database

---

## What the Admin (Business Owner) Can Do

- Log in to a protected admin panel
- View all incoming orders
- Update order statuses step by step: **Pending → Confirmed → Processing → Shipped → Delivered**
- Manage products (add, edit, remove) through the Sanity Studio — no coding needed

---

## The Tech Stack

| Layer | Tool | Plain English |
|---|---|---|
| **Frontend Framework** | TanStack Start (React) | Builds all the pages and screens the user interacts with |
| **Product Content** | Sanity CMS | A separate dashboard where products, images, and descriptions are managed |
| **Database** | Neon (PostgreSQL) | A cloud database that stores every order and customer record permanently |
| **Authentication** | Firebase | Handles user sign-up, login, and security |
| **Hosting — App** | Cloudflare Workers | Serves the website globally with no traditional server |
| **Hosting — Studio** | Sanity Cloud | Hosts the product management dashboard separately |
| **UI Components** | Radix UI + Custom CSS | Ready-made, accessible UI building blocks styled to match the brand |
| **Icons** | Lucide React | Clean, consistent icons throughout the UI |

---

## How It's Hosted

- **The storefront** runs on **Cloudflare Workers** — a serverless, globally distributed platform. There is no physical server. The app runs at the network edge, meaning it is fast for users in Uganda and anywhere else.
- **The Sanity Studio** is hosted independently on **Sanity's own cloud** — a separate system just for managing content.

These two systems talk to each other: when a product is updated in the Studio, it reflects on the live store immediately.

---

## How an Order Is Placed (Step by Step)

1. Customer adds items to cart and goes to checkout
2. They enter their details and choose a delivery zone
3. The app sends the order to the server
4. The **server** (not the browser) calculates the delivery fee — so it cannot be faked
5. The order is validated and saved to the Neon database
6. The admin sees the new order and can begin processing it

---

## Delivery Fee Logic

| Situation | Fee |
|---|---|
| Kampala, order ≥ UGX 1,500,000 | **Free** |
| Kampala, order below UGX 1,500,000 | UGX 50,000 |
| Upcountry (anywhere outside Kampala) | UGX 150,000 |

This is calculated and enforced on the server — the customer cannot manipulate it.

---

## Security

- Passwords and login are handled entirely by **Firebase** — an industry-standard auth system by Google
- Every admin action requires a verified token — a secret key the server checks before allowing anything
- Admin access is restricted to specific approved email addresses only
- Delivery fees and order totals are calculated server-side — cannot be altered from the browser

---

## Key Design Decisions & Why

- **No traditional server** — Cloudflare Workers means no server to maintain, no downtime, and global speed
- **Sanity CMS** — the business owner can update products without involving a developer
- **TanStack Start** — a modern React framework that handles both the frontend UI and backend API routes in one codebase
- **Neon (serverless PostgreSQL)** — a real relational database that scales automatically and requires no server management
- **Firebase Auth** — building secure authentication from scratch is risky; Firebase is trusted by millions of apps

---

## What Is Still Being Built

- **Order confirmation emails** — after a successful order, the customer will automatically receive an email receipt (via Resend, a developer email service)
- **Edge caching for products** — product data will be cached at Cloudflare's network level so pages load even faster

---

## Summary

Homeline is a real, deployed, full-stack e-commerce application with:
- A live storefront accessible to anyone on the internet
- A real database storing real orders
- A content management system for products
- A secure admin panel
- Automatic delivery fee calculation
- Multi-currency support
- User authentication

**It is not a school project prototype — it is a working product.**
