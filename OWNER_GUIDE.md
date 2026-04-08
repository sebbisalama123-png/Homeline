# Homeline Furniture Uganda — Owner's Guide

Everything you need to run, manage, and grow your store.

---

## Table of Contents

1. [First-Time Setup](#1-first-time-setup)
2. [Running the App Locally](#2-running-the-app-locally)
3. [Environment Variables (.env)](#3-environment-variables-env)
4. [Firebase Setup — Authentication](#4-firebase-setup--authentication)
5. [Neon Database Setup](#5-neon-database-setup)
6. [Sanity Studio — Managing Products](#6-sanity-studio--managing-products)
7. [Adding Products with Custom Images](#7-adding-products-with-custom-images)
8. [Receiving & Managing Orders](#8-receiving--managing-orders)
9. [Order Status Workflow](#9-order-status-workflow)
10. [Customer Order Tracking](#10-customer-order-tracking)
11. [Customer Accounts & Order History](#11-customer-accounts--order-history)
12. [Deploying to Production (Cloudflare)](#12-deploying-to-production-cloudflare)
13. [Your Daily Routine](#13-your-daily-routine)
14. [Quick Reference](#14-quick-reference)

---

## 1. First-Time Setup

Run this once when you first clone or set up the project:

```bash
# Install main app dependencies
npm install

# Install Sanity Studio dependencies
cd sanity-studio
npm install
cd ..
```

Then follow sections 3, 4, 5, and 6 to configure your services before starting.

---

## 2. Running the App Locally

You need **two terminals** open at the same time.

**Terminal 1 — Your storefront:**

```bash
npm run dev
```

Opens at → `http://localhost:3000`

**Terminal 2 — Sanity Studio (product management):**

```bash
cd sanity-studio
npm run dev
```

Opens at → `http://localhost:3333`

To stop either, press `Ctrl + C` in that terminal.

---

## 3. Environment Variables (.env)

Create a file called `.env` in the **root** of the project (next to `package.json`).
Copy this template and fill in your real values:

```bash
# ── Firebase (Authentication) ─────────────────────────────────────
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# ── Admin Access ──────────────────────────────────────────────────
# Comma-separated list of emails that can access /admin/orders
VITE_ADMIN_EMAILS=you@example.com
ADMIN_EMAILS=you@example.com

# ── Neon Database ─────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require

# ── Sanity CMS ────────────────────────────────────────────────────
VITE_SANITY_PROJECT_ID=abc1de2f
VITE_SANITY_DATASET=production
SANITY_API_TOKEN=skAbc...

# ── Resend (Order confirmation emails) ────────────────────────────
RESEND_API_KEY=re_...
```

> **Important:** Never commit `.env` to Git. It is already in `.gitignore`.

---

## 4. Firebase Setup — Authentication

Do this once at [console.firebase.google.com](https://console.firebase.google.com).

### Step 1 — Create project

- Click **Add project** → name it "Homeline Furniture" → Create
- You do not need Google Analytics

### Step 2 — Register your web app and get keys

- Project Settings (gear icon, top left) → **Your apps** → click **`</>`** (Web)
- App nickname: `storefront` → Register app
- Copy the values from `firebaseConfig` into your `.env` file

### Step 3 — Enable sign-in methods

- Left sidebar → **Build → Authentication → Sign-in method**
- Enable **Email/Password** → Save
- Enable **Google** → set your support email → Save

### Step 4 — Add authorized domains (when deploying)

- Authentication → **Settings** → **Authorized domains**
- Add your Cloudflare production URL

### Step 5 — Create your admin account

- Open `http://localhost:3000/auth/signup`
- Sign up using the email you put in `VITE_ADMIN_EMAILS`
- Check your inbox and click the verification link
- Go to `http://localhost:3000/auth/login` and sign in
- You will now see **Admin** in the navigation bar

---

## 5. Neon Database Setup

Do this once at [neon.tech](https://neon.tech).

1. Create a free account → **New project** → name it "hearth-timber"
2. Copy the **Connection string** (starts with `postgresql://`) into `DATABASE_URL` in your `.env`
3. Run the database migration to create the tables:

```bash
npm run db:push
```

That creates the `orders`, `order_items`, `order_status_history`, and `users` tables automatically.

### Pushing schema to your production database

Your dev and production databases are separate Neon branches. After deploying, run this once with your production connection string:

```bash
DATABASE_URL="postgresql://user:password@ep-prod-xyz.neon.tech/neondb?sslmode=require" npm run db:push
```

---

## 6. Sanity Studio — Managing Products

### First-time Studio setup

1. Go to [sanity.io](https://sanity.io) → create a free account
2. Click **Create project** → name it "Homeline Furniture Uganda" → choose **Blank**
3. Copy your **Project ID** from the dashboard into `VITE_SANITY_PROJECT_ID` and `SANITY_STUDIO_PROJECT_ID`
4. Get a read token: **API → Tokens → Add API token** → Role: **Viewer** → copy into `SANITY_API_TOKEN`
5. Add CORS origins: **API → CORS Origins** → Add `http://localhost:3000` and your production URL

### Create the Studio `.env` file

Inside the `sanity-studio/` folder, create `.env`:

```bash
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

### Run the Studio

```bash
cd sanity-studio
npm run dev
# Opens at http://localhost:3333
```

---

## 7. Adding Products with Custom Images

Open the Studio at `http://localhost:3333`.

### Step-by-step: adding one product

1. Click **Product** in the left sidebar → click **+ New product** (top right)

2. Fill in the fields:

   | Field                 | What to enter                            | Example                                 |
   | --------------------- | ---------------------------------------- | --------------------------------------- |
   | **Product Name**      | Full product name                        | `Kampala Oak Dining Table`              |
   | **Slug**              | Click **Generate** — auto-fills          | `kampala-oak-dining-table`              |
   | **Category**          | Pick from the dropdown                   | `Dining`                                |
   | **Short Description** | One-line teaser for the product card     | `Solid oak table for 6, made in Uganda` |
   | **Full Description**  | Full paragraph shown on the product page | Write 2–3 sentences                     |
   | **Price (UGX)**       | Whole number, no commas                  | `4500000`                               |
   | **Sale Price (UGX)**  | Leave empty if not on sale               | `3900000`                               |
   | **Availability**      | Select one                               | `In Stock` or `Made to Order`           |
   | **Material**          | Materials used                           | `Solid oak + stain-resistant fabric`    |
   | **Dimensions**        | Size details                             | `200cm L × 95cm W × 75cm H`             |
   | **Lead Time**         | Delivery time                            | `7–14 days delivery in Uganda`          |
   | **Rating**            | Out of 5                                 | `4.8`                                   |
   | **Review Count**      | Number of reviews                        | `12`                                    |

3. **Upload your main image:**
   - Click the **Main Image** field
   - Drag and drop your photo, or click to browse your computer
   - Best specs: **1200 × 900px**, JPG or WebP, under **2MB**
   - After upload you can drag the focus point (the circle) to set which part stays visible when cropped

4. **Upload gallery images (optional, up to 4):**
   - Scroll to **Gallery Images** → click **Add item**
   - Repeat for each additional photo (different angles, close-ups, room setting)

5. Click **Publish** in the top right corner

The product is now **live on your store instantly** — no restart needed.

---

## 8. Receiving & Managing Orders

When a customer fills out the checkout form and clicks **Place Order (COD)**, the order is saved to your database immediately.

### Viewing your orders

1. Sign in with your admin email → click **Admin** in the navigation bar
2. You are now at `/admin/orders`

### What each order card shows

```
#UG-20260402-1234   [Pending]
4 Apr 2026 · 10:30

Customer:  Jane Nansubuga
Phone:     +256 700 123 456
Location:  Kampala, Ntinda
Items: 2 · Total: UGX 4,300,000

[→ Mark Confirmed]   [✕ Mark Cancelled]
```

### Filtering orders

Use the **Status** dropdown at the top to show only orders in a specific stage.

### Status colours at a glance

| Colour | Status           | Meaning                    |
| ------ | ---------------- | -------------------------- |
| Amber  | Pending          | New, waiting for your call |
| Blue   | Confirmed        | You spoke to the customer  |
| Purple | Out for Delivery | Dispatched                 |
| Green  | Delivered        | Complete                   |
| Red    | Cancelled        | Cancelled                  |

---

## 9. Order Status Workflow

Every order follows this path. You move it forward by clicking the coloured button on the order card.

```
[Pending] ──► [Confirmed] ──► [Out for Delivery] ──► [Delivered]
    │               │                  │
    └───────────────┴──────────────────┴──► [Cancelled]
```

| Status               | Your action                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| **Pending**          | Call the customer to confirm. Click **Mark Confirmed** if they say yes. |
| **Confirmed**        | Hand item to delivery. Click **Mark Out for Delivery**.                 |
| **Out for Delivery** | When delivered, click **Mark Delivered**.                               |
| **Delivered**        | Nothing more to do.                                                     |
| **Cancelled**        | Click **Mark Cancelled** at any stage before delivery.                  |

> The status button flashes green and updates instantly when you click — you don't need to refresh the page.

### Delivery fee reference

| Location     | Order under UGX 1,500,000 | Order UGX 1,500,000+ |
| ------------ | ------------------------- | -------------------- |
| Kampala area | UGX 50,000                | **Free**             |
| Upcountry    | UGX 150,000               | UGX 150,000          |

---

## 10. Customer Order Tracking

Customers can check their own order status at:

```
https://your-domain.com/orders
```

They enter their **order number** (e.g. `UG-20260402-1234`) and see the current status and item list. Remind customers to save their order number when they complete checkout.

---

## 11. Customer Accounts & Order History

Customers can create an account with their email or Google, then view all their past orders signed in:

```
https://your-domain.com/account/orders
```

This shows every order placed with their email address — status, items, totals — without needing to remember an order number. The **My Orders** link appears in the navigation bar for any signed-in non-admin customer.

---

## 12. Deploying to Production (Cloudflare)

### One-time setup

**Install Wrangler CLI** (if not already done):

```bash
npm install -g wrangler
wrangler login
```

**Push your secrets to Cloudflare** (run each command and paste the value when prompted):

```bash
wrangler secret put DATABASE_URL
wrangler secret put ADMIN_EMAILS
wrangler secret put SANITY_API_TOKEN
wrangler secret put RESEND_API_KEY
```

> Note: `VITE_*` variables are bundled at build time from `.env`. Only server-only secrets need `wrangler secret put`.

### Deploy

```bash
npm run deploy
```

Cloudflare gives you a URL like `https://hearth-timber.your-name.workers.dev`.

### After deploying

1. **Firebase** → Authentication → Settings → Authorized domains → add your Cloudflare URL
2. **Sanity** → sanity.io/manage → your project → API → CORS Origins → add your Cloudflare URL
3. Push the schema to your production Neon branch (see Section 5)

### Re-deploying after changes

```bash
npm run deploy
```

Product changes in Sanity Studio go live **instantly** with no deploy needed.

---

## 13. Your Daily Routine

### Morning (5 minutes)

1. Open your store → sign in → click **Admin**
2. Set the filter to **Pending**
3. Call each pending customer to confirm their order
4. Click **Mark Confirmed** for each one you reach — the card flashes green to confirm

### During the day

- When you hand an item to your delivery person → **Mark Out for Delivery**
- When the customer receives it → **Mark Delivered**

### Adding new products (2 minutes)

1. Open `http://localhost:3333` (Sanity Studio)
2. Product → New product → fill in details → upload photos → **Publish**
3. Done — it appears on the store immediately

### End of day

- Check for any orders still on **Pending** that you did not reach
- Try calling again or follow up tomorrow

---

## 14. Quick Reference

| Task                    | URL / Command                                               |
| ----------------------- | ----------------------------------------------------------- |
| Start the store         | `npm run dev` → `http://localhost:3000`                     |
| Start Sanity Studio     | `cd sanity-studio && npm run dev` → `http://localhost:3333` |
| View your orders        | `http://localhost:3000/admin/orders`                        |
| Sign in as admin        | `http://localhost:3000/auth/login`                          |
| Customer order lookup   | `http://localhost:3000/orders`                              |
| Customer order history  | `http://localhost:3000/account/orders`                      |
| Push database schema    | `npm run db:push`                                           |
| Run tests               | `npm test`                                                  |
| Deploy to production    | `npm run deploy`                                            |
| Set a Cloudflare secret | `wrangler secret put SECRET_NAME`                           |

---

## Troubleshooting

**"Firebase is not configured" on the login page**
→ Check that all four `VITE_FIREBASE_*` variables are set in `.env` and restart `npm run dev`.

**"Database not configured" error on orders**
→ Check that `DATABASE_URL` is set in `.env`. Run `npm run db:push` to create tables.

**No products showing in the store**
→ If Sanity is not configured yet (`VITE_SANITY_PROJECT_ID` not set), the store falls back to sample products automatically. Once you set the Project ID, products come from Sanity — make sure you have published at least one product in the Studio.

**Admin link not showing in the nav**
→ Make sure the email you signed in with exactly matches what is in `VITE_ADMIN_EMAILS` (case-insensitive, no spaces). Also verify your email address in Firebase.

**Order status button not working**
→ You may be signed out. Refresh the page and sign back in. If the issue persists, check that `DATABASE_URL` is set correctly.

**Orders not showing on My Orders page**
→ The customer must be signed in with the same email they used at checkout. If they checked out as a guest (no account), they can still track by order number at `/orders`.
