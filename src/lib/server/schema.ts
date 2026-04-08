import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  location: text('location').notNull(),
  notes: text('notes'),
  paymentMethod: text('payment_method').notNull().default('COD'),
  status: text('status').notNull().default('pending'),
  subtotalUgx: integer('subtotal_ugx').notNull(),
  deliveryFeeUgx: integer('delivery_fee_ugx').notNull().default(0),
  totalUgx: integer('total_ugx').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  productSlug: text('product_slug').notNull(),
  productName: text('product_name').notNull(),
  unitPriceUgx: integer('unit_price_ugx').notNull(),
  quantity: integer('quantity').notNull(),
  lineTotalUgx: integer('line_total_ugx').notNull(),
  createdAt: text('created_at').notNull(),
})

export const orderStatusHistory = pgTable('order_status_history', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  oldStatus: text('old_status'),
  newStatus: text('new_status').notNull(),
  changedBy: text('changed_by').notNull().default('system'),
  reason: text('reason'),
  changedAt: text('changed_at').notNull(),
})

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const schema = {
  orders,
  orderItems,
  orderStatusHistory,
  users,
}
