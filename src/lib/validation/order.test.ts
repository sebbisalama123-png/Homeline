import { describe, it, expect } from 'vitest'
import {
  canTransitionOrderStatus,
  createOrderInputSchema,
  customerDetailsSchema,
} from './order'

describe('canTransitionOrderStatus', () => {
  it('allows pending → confirmed', () => {
    expect(canTransitionOrderStatus('pending', 'confirmed')).toBe(true)
  })

  it('allows pending → cancelled', () => {
    expect(canTransitionOrderStatus('pending', 'cancelled')).toBe(true)
  })

  it('allows confirmed → out_for_delivery', () => {
    expect(canTransitionOrderStatus('confirmed', 'out_for_delivery')).toBe(true)
  })

  it('allows out_for_delivery → delivered', () => {
    expect(canTransitionOrderStatus('out_for_delivery', 'delivered')).toBe(true)
  })

  it('blocks delivered → any status', () => {
    expect(canTransitionOrderStatus('delivered', 'cancelled')).toBe(false)
    expect(canTransitionOrderStatus('delivered', 'pending')).toBe(false)
  })

  it('blocks cancelled → any status', () => {
    expect(canTransitionOrderStatus('cancelled', 'confirmed')).toBe(false)
  })

  it('blocks backwards transitions', () => {
    expect(canTransitionOrderStatus('confirmed', 'pending')).toBe(false)
    expect(canTransitionOrderStatus('out_for_delivery', 'confirmed')).toBe(false)
  })

  it('returns false for unknown statuses', () => {
    expect(canTransitionOrderStatus('unknown', 'confirmed')).toBe(false)
    expect(canTransitionOrderStatus('pending', 'unknown')).toBe(false)
  })
})

describe('customerDetailsSchema', () => {
  const valid = {
    fullName: 'Jane Nansubuga',
    phone: '+256 700 123 456',
    email: 'jane@example.com',
    location: 'Kampala, Ntinda',
  }

  it('accepts valid customer details', () => {
    expect(customerDetailsSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a short name', () => {
    const result = customerDetailsSchema.safeParse({ ...valid, fullName: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid phone number', () => {
    const result = customerDetailsSchema.safeParse({ ...valid, phone: '0700123456' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = customerDetailsSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing location', () => {
    const result = customerDetailsSchema.safeParse({ ...valid, location: 'K' })
    expect(result.success).toBe(false)
  })
})

describe('createOrderInputSchema', () => {
  const validItem = {
    slug: 'marlow-cloud-sofa',
    name: 'Marlow Cloud Sofa',
    unitPrice: 2_800_000,
    quantity: 1,
  }

  const validOrder = {
    fullName: 'Jane Nansubuga',
    phone: '+256 700 123 456',
    email: 'jane@example.com',
    location: 'Kampala, Ntinda',
    items: [validItem],
  }

  it('accepts a valid order', () => {
    expect(createOrderInputSchema.safeParse(validOrder).success).toBe(true)
  })

  it('rejects an order with no items', () => {
    const result = createOrderInputSchema.safeParse({ ...validOrder, items: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an item with zero quantity', () => {
    const result = createOrderInputSchema.safeParse({
      ...validOrder,
      items: [{ ...validItem, quantity: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an item with zero price', () => {
    const result = createOrderInputSchema.safeParse({
      ...validOrder,
      items: [{ ...validItem, unitPrice: 0 }],
    })
    expect(result.success).toBe(false)
  })
})
