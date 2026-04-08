import React from 'react'
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  convertFromUGX,
  formatMoney,
} from '../lib/currency'
import type { SupportedCurrency } from '../lib/currency'

type CurrencyContextValue = {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  formatPrice: (amount: number) => string
  options: readonly SupportedCurrency[]
}

const STORAGE_KEY = 'storefront.currency'

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] =
    React.useState<SupportedCurrency>(DEFAULT_CURRENCY)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_CURRENCIES.includes(stored as SupportedCurrency)) {
      setCurrency(stored as SupportedCurrency)
    }
  }, [])

  const handleSetCurrency = React.useCallback((next: SupportedCurrency) => {
    setCurrency(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = React.useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency: handleSetCurrency,
      formatPrice: (amount: number) =>
        formatMoney(convertFromUGX(amount, currency), currency),
      options: SUPPORTED_CURRENCIES,
    }),
    [currency, handleSetCurrency],
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used inside CurrencyProvider')
  }
  return context
}
