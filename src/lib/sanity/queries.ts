import { isSanityConfigured, sanityClient } from './client'
import { cachedSanityFetch } from './cache'
import type { SanityProduct } from './types'
import { products as localProducts } from '../../data/catalog'

const PRODUCT_FIELDS = `
  "slug": slug.current,
  name,
  category,
  shortDescription,
  description,
  "image": image.asset->url,
  "gallery": gallery[].asset->url,
  price,
  salePrice,
  rating,
  reviews,
  material,
  dimensions,
  leadTime,
  availability
`

export async function getAllProducts(): Promise<SanityProduct[]> {
  if (!isSanityConfigured()) {
    return localProducts as unknown as SanityProduct[]
  }

  return cachedSanityFetch('all-products', () =>
    sanityClient.fetch<SanityProduct[]>(
      `*[_type == "product"] | order(_createdAt asc) { _id, _type, ${PRODUCT_FIELDS} }`,
    ),
  )
}

export async function getProductBySlug(
  slug: string,
): Promise<SanityProduct | null> {
  if (!isSanityConfigured()) {
    const local = localProducts.find((p) => p.slug === slug)
    return local ? (local as unknown as SanityProduct) : null
  }

  const results = await cachedSanityFetch(`product-${slug}`, () =>
    sanityClient.fetch<SanityProduct[]>(
      `*[_type == "product" && slug.current == $slug][0..0] { _id, _type, ${PRODUCT_FIELDS} }`,
      { slug },
    ),
  )

  return results[0] ?? null
}

export async function getProductsByCategory(
  category: string,
): Promise<SanityProduct[]> {
  if (!isSanityConfigured()) {
    return localProducts.filter(
      (p) => p.category === category,
    ) as unknown as SanityProduct[]
  }

  return cachedSanityFetch(`category-${category}`, () =>
    sanityClient.fetch<SanityProduct[]>(
      `*[_type == "product" && category == $category] | order(_createdAt asc) { _id, _type, ${PRODUCT_FIELDS} }`,
      { category },
    ),
  )
}

export async function getCategories(): Promise<string[]> {
  if (!isSanityConfigured()) {
    return Array.from(new Set(localProducts.map((p) => p.category)))
  }

  return cachedSanityFetch('categories', () =>
    sanityClient.fetch<string[]>(
      `array::unique(*[_type == "product"].category)`,
    ),
  )
}
