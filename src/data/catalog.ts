export type RoomCollection = {
  slug: string
  name: string
  description: string
  tone: string
  image: string
}

export type Product = {
  slug: string
  name: string
  category: string
  shortDescription: string
  description: string
  image: string
  gallery?: string[]
  price: number
  salePrice?: number
  rating: number
  reviews: number
  material: string
  dimensions: string
  leadTime: string
  availability: 'In Stock' | 'Made to Order'
}

export const roomCollections: RoomCollection[] = [
  {
    slug: 'living-room',
    name: 'Living Room',
    description: 'Statement sofas, coffee tables, and textured accents.',
    tone: 'from-[#f2dfca] to-[#e7cbb2]',
    image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=75',
  },
  {
    slug: 'bedroom',
    name: 'Bedroom',
    description: 'Calm palettes, plush fabrics, and warm oak finishes.',
    tone: 'from-[#d9e4da] to-[#bccfbc]',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=75',
  },
  {
    slug: 'dining',
    name: 'Dining',
    description: 'Timeless tables and elegant seating for everyday hosting.',
    tone: 'from-[#dad4ea] to-[#c1b7dd]',
    image: 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&w=800&q=75',
  },
  {
    slug: 'home-office',
    name: 'Home Office',
    description: 'Focused layouts with ergonomic comfort and clean lines.',
    tone: 'from-[#dce4ef] to-[#c2d0df]',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=75',
  },
  {
    slug: 'kitchen-&-bar',
    name: 'Kitchen & Bar',
    description: 'Modern stools, sleek cabinetry, and artisanal pendant lighting.',
    tone: 'from-[#e5e7eb] to-[#9ca3af]',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=75',
  },
  {
    slug: 'kids-room',
    name: 'Kids Room',
    description: 'Playful textures, imaginative storage, and soft, safe finishes.',
    tone: 'from-[#fef3c7] to-[#fde68a]',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=75',
  },
]

export const products: Product[] = [
  {
    slug: 'marlow-cloud-sofa',
    name: 'Marlow Cloud Sofa',
    category: 'Living Room',
    shortDescription: 'Deep-seat comfort with a soft textured finish.',
    description:
      'A generous 3-seater made for all-day lounging with high-density cushions and durable upholstery.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c015d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
    ],
    price: 4700000,
    salePrice: 4300000,
    rating: 4.8,
    reviews: 46,
    material: 'Kiln-dried hardwood frame, bouclé blend',
    dimensions: '230cm W x 98cm D x 83cm H',
    leadTime: '7-14 days delivery in Uganda',
    availability: 'Made to Order',
  },
  {
    slug: 'ashton-oak-dining-set',
    name: 'Ashton Oak Dining Set',
    category: 'Dining',
    shortDescription: 'Solid oak table with six upholstered chairs.',
    description:
      'Designed for daily meals and weekend hosting, with rounded corners and premium oak grain selection.',
    image:
      'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616628182509-6f8910b82072?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80',
    ],
    price: 6900000,
    rating: 4.9,
    reviews: 31,
    material: 'Solid oak + stain-resistant fabric',
    dimensions: 'Table 200cm L x 95cm W x 75cm H',
    leadTime: '10-18 days delivery in Uganda',
    availability: 'Made to Order',
  },
  {
    slug: 'valen-upholstered-bed',
    name: 'Valen Upholstered Bed',
    category: 'Bedroom',
    shortDescription: 'Modern headboard profile with hidden support slats.',
    description:
      'A calm bedroom centerpiece with premium stitched upholstery and reinforced center beam support.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617098474202-0d0d7f60e4f5?auto=format&fit=crop&w=1200&q=80',
    ],
    price: 4400000,
    salePrice: 3900000,
    rating: 4.7,
    reviews: 52,
    material: 'Engineered hardwood + linen blend',
    dimensions: 'Queen 164cm W x 214cm L x 125cm H',
    leadTime: '5-10 days delivery in Uganda',
    availability: 'Made to Order',
  },
  {
    slug: 'arc-floor-lamp',
    name: 'Arc Floor Lamp',
    category: 'Lighting',
    shortDescription: 'Sculptural curved lamp for ambient corner lighting.',
    description:
      'Brushed metal frame with weighted base and warm soft-diffused shade for evening ambiance.',
    image:
      'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1200&q=80',
    price: 980000,
    rating: 4.6,
    reviews: 18,
    material: 'Powder-coated steel + linen shade',
    dimensions: '180cm H x 112cm reach',
    leadTime: '3-7 days delivery in Uganda',
    availability: 'In Stock',
  },
  {
    slug: 'isla-accent-chair',
    name: 'Isla Accent Chair',
    category: 'Living Room',
    shortDescription: 'Compact accent chair with high-comfort cushioning.',
    description:
      'Ideal for apartments and reading corners, combining lumbar support with a compact footprint.',
    image:
      'https://images.unsplash.com/photo-1595515106864-077d3017d6df?auto=format&fit=crop&w=1200&q=80',
    price: 1650000,
    rating: 4.5,
    reviews: 24,
    material: 'Hardwood frame + woven polyester',
    dimensions: '82cm W x 78cm D x 83cm H',
    leadTime: '4-9 days delivery in Uganda',
    availability: 'In Stock',
  },
  {
    slug: 'porter-sideboard',
    name: 'Porter Sideboard',
    category: 'Storage',
    shortDescription: 'Streamlined storage with soft-close internal shelving.',
    description:
      'A versatile sideboard for dining and living rooms with adjustable shelves and cable routing.',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    price: 3150000,
    rating: 4.7,
    reviews: 20,
    material: 'Oak veneer + soft-close hardware',
    dimensions: '180cm W x 45cm D x 78cm H',
    leadTime: '7-12 days delivery in Uganda',
    availability: 'Made to Order',
  },
  {
    slug: 'soren-coffee-table',
    name: 'Soren Coffee Table',
    category: 'Living Room',
    shortDescription: 'Rounded silhouette with layered open shelf.',
    description:
      'A living-room anchor with durable finish and softly rounded edges for family-safe circulation.',
    image:
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
    price: 1420000,
    rating: 4.6,
    reviews: 27,
    material: 'Ash veneer + matte lacquer',
    dimensions: '120cm W x 68cm D x 39cm H',
    leadTime: '3-8 days delivery in Uganda',
    availability: 'In Stock',
  },
  {
    slug: 'luna-area-rug',
    name: 'Luna Area Rug 240 x 340',
    category: 'Living Room',
    shortDescription: 'Soft low-pile rug with subtle tonal pattern.',
    description:
      'Balances warmth and durability with easy-care fibers suited for high-traffic homes.',
    image:
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
    price: 1380000,
    salePrice: 1190000,
    rating: 4.4,
    reviews: 41,
    material: 'Poly-wool blend, low pile',
    dimensions: '240cm x 340cm',
    leadTime: '2-5 days delivery in Uganda',
    availability: 'In Stock',
  },
]

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug)
}

export const catalogCategories = ["Living Room", "Bedroom", "Dining", "Home Office","Kitchen & Bar", "Kids Room"];

// Array.from(
//   new Set(products.map((product) => product.category)),
// )

export function categoryToSlug(category: string) {
  return category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')
}

export function slugToCategory(slug: string) {
  return catalogCategories.find((category) => categoryToSlug(category) === slug)
}
