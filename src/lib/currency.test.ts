import { describe, it, expect } from 'vitest'
import { convertFromUGX, formatMoney } from './currency'

describe('convertFromUGX', () => {
  it('returns the same amount for UGX', () => {
    expect(convertFromUGX(1_000_000, 'UGX')).toBe(1_000_000)
  })

  it('converts UGX to USD using the expected rate', () => {
    const result = convertFromUGX(3_800, 'USD')
    expect(result).toBe(1)
  })

  it('converts UGX to EUR using the expected rate', () => {
    const result = convertFromUGX(4_100, 'EUR')
    expect(result).toBe(1)
  })

  it('rounds UGX to whole numbers', () => {
    expect(convertFromUGX(999, 'UGX')).toBe(999)
  })

  it('rounds USD to 2 decimal places', () => {
    const result = convertFromUGX(1, 'USD')
    expect(Number(result.toFixed(2))).toBe(result)
  })
})

describe('formatMoney', () => {
  it('formats UGX without decimal places', () => {
    const result = formatMoney(1_500_000, 'UGX')
    expect(result).toContain('1,500,000')
    expect(result).not.toContain('.')
  })

  it('formats USD with 2 decimal places', () => {
    const result = formatMoney(394.74, 'USD')
    expect(result).toContain('394.74')
  })

  it('formats EUR with 2 decimal places', () => {
    const result = formatMoney(365.85, 'EUR')
    expect(result).toContain('365.85')
  })

  it('includes the currency symbol for USD', () => {
    const result = formatMoney(100, 'USD')
    expect(result).toContain('$')
  })
})
