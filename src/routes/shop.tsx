import { createFileRoute } from '@tanstack/react-router'
import ShopCatalog from '../components/ShopCatalog'
import { getAllProducts, getCategories } from '../lib/sanity/queries'
import type { SanityProduct } from '../lib/sanity/types'

type ShopLoaderData = { products: SanityProduct[]; categories: string[] }

export const Route = createFileRoute('/shop')({
  head: () => ({
    meta: [
      { title: 'Shop All Furniture | Hearth & Timber Uganda' },
      {
        name: 'description',
        content:
          'Browse handcrafted furniture for living, dining, bedroom, and office spaces. All prices in Uganda Shillings.',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    const q = typeof search.q === 'string' ? search.q.trim() : ''
    return q ? { q } : {}
  },
  loader: async (): Promise<ShopLoaderData> => {
    const [products, categories] = await Promise.all([
      getAllProducts(),
      getCategories(),
    ])
    return { products, categories }
  },
  component: ShopPage,
})

function ShopPage() {
  const { q } = Route.useSearch()
  const { products, categories } = Route.useLoaderData() as ShopLoaderData

  return (
    <ShopCatalog
      title="Designed for homes across Uganda."
      description="Explore handcrafted pieces for living, dining, bedroom, and office spaces. All prices default to Uganda Shillings."
      products={products}
      allCategories={categories}
      initialQuery={q ?? ''}
    />
  )
}
