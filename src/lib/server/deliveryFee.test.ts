import { describe, it, expect } from 'vitest'
import { calculateDeliveryFee } from './deliveryFee'

const FREE_THRESHOLD = 1_500_000

describe('calculateDeliveryFee', () => {
  it('is free for Kampala orders above the threshold', () => {
    expect(calculateDeliveryFee('Kampala, Ntinda', FREE_THRESHOLD)).toBe(0)
    expect(calculateDeliveryFee('Kampala, Kololo', FREE_THRESHOLD + 1)).toBe(0)
  })

  it('charges 50,000 for Kampala orders below the threshold', () => {
    expect(calculateDeliveryFee('Kampala, Ntinda', FREE_THRESHOLD - 1)).toBe(50_000)
  })

  it('recognises common Kampala suburbs', () => {
    expect(calculateDeliveryFee('Ntinda', FREE_THRESHOLD)).toBe(0)
    expect(calculateDeliveryFee('Wakiso', FREE_THRESHOLD)).toBe(0)
    expect(calculateDeliveryFee('Entebbe', FREE_THRESHOLD)).toBe(0)
    expect(calculateDeliveryFee('Mukono', FREE_THRESHOLD)).toBe(0)
  })

  it('charges 150,000 for upcountry locations', () => {
    expect(calculateDeliveryFee('Mbarara', FREE_THRESHOLD)).toBe(150_000)
    expect(calculateDeliveryFee('Gulu', 500_000)).toBe(150_000)
    expect(calculateDeliveryFee('Jinja', 0)).toBe(150_000)
  })

  it('is case-insensitive for location matching', () => {
    expect(calculateDeliveryFee('kampala central', FREE_THRESHOLD)).toBe(0)
    expect(calculateDeliveryFee('KAMPALA', FREE_THRESHOLD)).toBe(0)
  })
})
