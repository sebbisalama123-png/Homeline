export type SanityImageAsset = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

export type SanityProduct = {
  _id: string
  _type: 'product'
  slug: string
  name: string
  category: string
  shortDescription: string
  description: string
  image: string
  gallery: string[]
  price: number
  salePrice?: number
  rating: number
  reviews: number
  material: string
  dimensions: string
  leadTime: string
  availability: 'In Stock' | 'Made to Order'
}
