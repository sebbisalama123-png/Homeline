import { z } from 'zod'

const ugandaPhoneRegex = /^\+256\s7\d{2}\s\d{3}\s\d{3}$/

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const

export const orderItemInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export const customerDetailsSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().regex(ugandaPhoneRegex, {
    message: 'Enter a valid Uganda number, e.g. +256 700 123 456.',
  }),
  email: z.email('Enter a valid email address.'),
  location: z.string().trim().min(2, 'Enter your delivery location.'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})

export const createOrderInputSchema = customerDetailsSchema.extend({
  items: z
    .array(orderItemInputSchema)
    .min(1, 'At least one cart item is required.'),
})

export const orderStatusSchema = z.enum(ORDER_STATUSES)

const ALLOWED_TRANSITIONS: Record<
  z.infer<typeof orderStatusSchema>,
  ReadonlyArray<z.infer<typeof orderStatusSchema>>
> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export const updateOrderStatusInputSchema = z.object({
  status: orderStatusSchema,
  reason: z.string().trim().max(300).optional(),
})

export function canTransitionOrderStatus(from: string, to: string): boolean {
  const parsedFrom = orderStatusSchema.safeParse(from)
  const parsedTo = orderStatusSchema.safeParse(to)

  if (!parsedFrom.success || !parsedTo.success) {
    return false
  }

  return ALLOWED_TRANSITIONS[parsedFrom.data].includes(parsedTo.data)
}

export type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
