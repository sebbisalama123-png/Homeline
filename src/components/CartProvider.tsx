import React from 'react'

type AddableProduct = {
  slug: string
  name: string
  image: string
  price: number
  salePrice?: number
}

type CartItem = {
  slug: string
  name: string
  image: string
  unitPrice: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  cartCount: number
  subtotal: number
  addItem: (product: AddableProduct) => void
  increment: (slug: string) => void
  decrement: (slug: string) => void
  remove: (slug: string) => void
  clear: () => void
}

const STORAGE_KEY = 'storefront.cart'

const CartContext = React.createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])

  React.useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as CartItem[]
      if (Array.isArray(parsed)) {
        setItems(parsed)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = React.useCallback((product: AddableProduct) => {
    setItems((current) => {
      const existing = current.find((item) => item.slug === product.slug)
      if (existing) {
        return current.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [
        ...current,
        {
          slug: product.slug,
          name: product.name,
          image: product.image,
          unitPrice: product.salePrice ?? product.price,
          quantity: 1,
        },
      ]
    })
  }, [])

  const increment = React.useCallback((slug: string) => {
    setItems((current) =>
      current.map((item) =>
        item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }, [])

  const decrement = React.useCallback((slug: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.slug === slug ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const remove = React.useCallback((slug: string) => {
    setItems((current) => current.filter((item) => item.slug !== slug))
  }, [])

  const clear = React.useCallback(() => {
    setItems([])
  }, [])

  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  )

  const cartCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      cartCount,
      subtotal,
      addItem,
      increment,
      decrement,
      remove,
      clear,
    }),
    [items, cartCount, subtotal, addItem, increment, decrement, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
