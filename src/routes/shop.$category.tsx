import { createFileRoute, notFound } from '@tanstack/react-router'
import ShopCatalog from '../components/ShopCatalog'
import { slugToCategory } from '../data/catalog'
import { getCategories, getProductsByCategory } from '../lib/sanity/queries'
import type { SanityProduct } from '../lib/sanity/types'

type CategoryLoaderData = {
  category: string
  products: SanityProduct[]
  allCategories: string[]
}

export const Route = createFileRoute('/shop/$category')({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData} Furniture | Homeline Furniture Uganda`
          : 'Shop | Homeline Furniture Uganda',
      },
      {
        name: 'description',
        content: loaderData
          ? `Shop ${loaderData} furniture — handcrafted pieces for Ugandan homes. Browse and order with cash on delivery.`
          : 'Browse furniture collections at Homeline Furniture Uganda.',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    const q = typeof search.q === 'string' ? search.q.trim() : ''
    return q ? { q } : {}
  },
  component: CategoryShopPage,
  loader: async ({ params }): Promise<CategoryLoaderData> => {
    const category = slugToCategory(params.category)
    if (!category) {
      throw notFound()
    }
    const [products, allCategories] = await Promise.all([
      getProductsByCategory(category),
      getCategories(),
    ])
    return { category, products, allCategories }
  },
})

function CategoryShopPage() {
  const { category, products, allCategories } =
    Route.useLoaderData() as CategoryLoaderData
  const { q } = Route.useSearch()

  return (
    <ShopCatalog
      title={category}
      description="Explore curated pieces in this collection. All prices default to Uganda Shillings."
      products={products}
      allCategories={allCategories}
      presetCategory={category}
      initialQuery={q ?? ''}
    />
  )
}
