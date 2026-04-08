export const SUPPORTED_CURRENCIES = ['UGX', 'USD', 'EUR'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

const BASE_CURRENCY: SupportedCurrency = 'UGX'

const UGX_EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  UGX: 1,
  USD: 1 / 3800,
  EUR: 1 / 4100,
}

const CURRENCY_LOCALE: Record<SupportedCurrency, string> = {
  UGX: 'en-UG',
  USD: 'en-US',
  EUR: 'en-IE',
}

const FRACTION_DIGITS: Record<SupportedCurrency, number> = {
  UGX: 0,
  USD: 2,
  EUR: 2,
}

export const DEFAULT_CURRENCY: SupportedCurrency = 'UGX'

export function convertFromUGX(
  amountInUGX: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
) {
  const converted = amountInUGX * UGX_EXCHANGE_RATES[currency]
  return FRACTION_DIGITS[currency] === 0
    ? Math.round(converted)
    : Number(converted.toFixed(FRACTION_DIGITS[currency]))
}

export function currencyLocale(currency: SupportedCurrency) {
  return CURRENCY_LOCALE[currency]
}

export function baseCurrency() {
  return BASE_CURRENCY
}

export function formatMoney(
  amount: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
  locale = currencyLocale(currency),
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: FRACTION_DIGITS[currency],
    maximumFractionDigits: FRACTION_DIGITS[currency],
  }).format(amount)
}
