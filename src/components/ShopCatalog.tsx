import { Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { SlidersHorizontal, Star, X } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import SmartImage from './SmartImage'
import { Select } from './ui/Select'
import type { SanityProduct } from '../lib/sanity/types'
import { catalogCategories, categoryToSlug } from '../data/catalog'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
] as const

type SortOption = (typeof SORT_OPTIONS)[number]['value']

type ShopCatalogProps = {
  title: string
  description: string
  products: SanityProduct[]
  allCategories?: string[]
  presetCategory?: string
  initialQuery?: string
}

type MaterialBand = 'all' | 'wood' | 'upholstered' | 'metal'
type AvailabilityBand = 'all' | 'in-stock' | 'made-to-order'

const ALL_LABEL = 'All'
const PRICE_STEP = 100_000

const MATERIAL_BANDS: ReadonlyArray<{ value: MaterialBand; label: string }> = [
  { value: 'all', label: 'Any Material' },
  { value: 'wood', label: 'Wood & Veneer' },
  { value: 'upholstered', label: 'Upholstered Fabric' },
  { value: 'metal', label: 'Metal & Steel' },
]

const AVAILABILITY_BANDS: ReadonlyArray<{
  value: AvailabilityBand
  label: string
}> = [
  { value: 'all', label: 'Any Availability' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'made-to-order', label: 'Made to Order' },
]

function matchesMaterialBand(material: string, band: MaterialBand): boolean {
  const value = material.toLowerCase()

  if (band === 'wood') {
    return /wood|oak|ash|veneer/.test(value)
  }
  if (band === 'upholstered') {
    return /fabric|linen|polyester|blend|boucl/.test(value)
  }
  if (band === 'metal') {
    return /metal|steel/.test(value)
  }
  return true
}

function matchesAvailabilityBand(
  availability: string,
  band: AvailabilityBand,
): boolean {
  if (band === 'in-stock') {
    return availability === 'In Stock'
  }
  if (band === 'made-to-order') {
    return availability === 'Made to Order'
  }
  return true
}

function materialLabel(value: MaterialBand): string {
  return MATERIAL_BANDS.find((band) => band.value === value)?.label ?? value
}

function availabilityLabel(value: AvailabilityBand): string {
  return AVAILABILITY_BANDS.find((band) => band.value === value)?.label ?? value
}

export default function ShopCatalog({
  title,
  description,
  products,
  allCategories,
  presetCategory,
  initialQuery = '',
}: ShopCatalogProps) {
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const normalizedQuery = initialQuery.trim().toLowerCase()

  const CATEGORIES = [ALL_LABEL, ...(allCategories ?? catalogCategories)]

  // URL is the source of truth for the active category.
  // The route loader pre-filters `products` to the active category,
  // so no client-side re-filtering is needed here.
  const activeCategory = presetCategory ?? ALL_LABEL

  const PRICE_MIN = useMemo(
    () =>
      products.length > 0
        ? Math.min(...products.map((p) => p.salePrice ?? p.price))
        : 0,
    [products],
  )
  const PRICE_MAX = useMemo(
    () =>
      products.length > 0
        ? Math.max(...products.map((p) => p.salePrice ?? p.price))
        : 10_000_000,
    [products],
  )

  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ])
  const [selectedMaterialBands, setSelectedMaterialBands] = useState<
    MaterialBand[]
  >([])
  const [selectedAvailabilityBand, setSelectedAvailabilityBand] =
    useState<AvailabilityBand>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Products are already scoped to the active category by the route loader.
  const categoryScopedProducts = useMemo(() => [...products], [products])

  const visibleProducts = useMemo(() => {
    const filtered = categoryScopedProducts.filter((product) => {
      const displayPrice = product.salePrice ?? product.price
      const queryHaystack = [
        product.name,
        product.category,
        product.shortDescription,
        product.material,
      ]
        .join(' ')
        .toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0 || queryHaystack.includes(normalizedQuery)

      return (
        matchesQuery &&
        displayPrice >= priceRange[0] &&
        displayPrice <= priceRange[1] &&
        (selectedMaterialBands.length === 0 ||
          selectedMaterialBands.some((band) =>
            matchesMaterialBand(product.material, band),
          )) &&
        matchesAvailabilityBand(product.availability, selectedAvailabilityBand)
      )
    })

    if (sortBy === 'price-low') {
      return filtered.sort(
        (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
      )
    }

    if (sortBy === 'price-high') {
      return filtered.sort(
        (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price),
      )
    }

    if (sortBy === 'rating') {
      return filtered.sort((a, b) => b.rating - a.rating)
    }

    return filtered
  }, [
    categoryScopedProducts,
    normalizedQuery,
    priceRange,
    selectedAvailabilityBand,
    selectedMaterialBands,
    sortBy,
  ])

  const hasActiveFilter =
    priceRange[0] !== PRICE_MIN ||
    priceRange[1] !== PRICE_MAX ||
    selectedMaterialBands.length > 0 ||
    selectedAvailabilityBand !== 'all' ||
    activeCategory !== ALL_LABEL

  const activeFilterCount =
    (activeCategory !== ALL_LABEL ? 1 : 0) +
    (priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ? 1 : 0) +
    (selectedMaterialBands.length > 0 ? 1 : 0) +
    (selectedAvailabilityBand !== 'all' ? 1 : 0)

  const setMinPrice = (nextMin: number) => {
    setPriceRange(([_, max]) => [Math.min(nextMin, max), max])
  }

  const setMaxPrice = (nextMax: number) => {
    setPriceRange(([min]) => [min, Math.max(nextMax, min)])
  }

  const toggleMaterial = (band: MaterialBand) => {
    setSelectedMaterialBands((current) =>
      current.includes(band)
        ? current.filter((value) => value !== band)
        : [...current, band],
    )
  }

  // Navigates to the appropriate route, preserving any active search query.
  const navigateToCategory = (category: string) => {
    if (category === ALL_LABEL) {
      void navigate({
        to: '/shop',
        search: () => (initialQuery ? { q: initialQuery } : {}),
      })
    } else {
      void navigate({
        to: '/shop/$category',
        params: { category: categoryToSlug(category) },
        search: () => (initialQuery ? { q: initialQuery } : {}),
      })
    }
  }

  const resetFilters = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setSelectedMaterialBands([])
    setSelectedAvailabilityBand('all')
    if (activeCategory !== ALL_LABEL) {
      void navigate({ to: '/shop', search: () => ({}) })
    }
  }

  const hasPriceFilter = useMemo(
    () => priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX,
    [priceRange, PRICE_MIN, PRICE_MAX],
  )

  return (
    <main className="page-wrap shop-catalog-page px-4 pb-12 pt-8">
      <section className="shop-heading reveal-in">
        <p className="eyebrow mb-3">Shop Furniture</p>
        <h1 className="display-title m-0 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-(--ink-soft)">{description}</p>
        {normalizedQuery ? (
          <p className="mt-3 text-sm font-semibold text-(--ink)">
            Search results for "{initialQuery.trim()}"
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="shop-sidebar reveal-in hidden lg:block">
          <h2>Categories</h2>
          <div className="shop-chips">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => navigateToCategory(item)}
                aria-pressed={item === activeCategory}
                className={item === activeCategory ? 'chip is-active' : 'chip'}
              >
                {item}
              </button>
            ))}
          </div>

          <h2 className="shop-filter-title">Price Range</h2>
          <div className="price-slider">
            <p>
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </p>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[0]}
              onChange={(event) => setMinPrice(Number(event.target.value))}
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[1]}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              aria-label="Maximum price"
            />
          </div>

          <h2 className="shop-filter-title">Material</h2>
          <div className="check-stack">
            {MATERIAL_BANDS.map((band) => {
              if (band.value === 'all') {
                return null
              }
              const count = categoryScopedProducts.filter((product) =>
                matchesMaterialBand(product.material, band.value),
              ).length
              return (
                <label
                  key={band.value}
                  className={
                    selectedMaterialBands.includes(band.value)
                      ? 'check-row is-active'
                      : 'check-row'
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedMaterialBands.includes(band.value)}
                    onChange={() => toggleMaterial(band.value)}
                  />
                  <span>{band.label}</span>
                  <span className="chip-count">{count}</span>
                </label>
              )
            })}
          </div>

          <h2 className="shop-filter-title">Availability</h2>
          <div className="shop-chips">
            {AVAILABILITY_BANDS.map((band) => {
              const count = categoryScopedProducts.filter((product) =>
                matchesAvailabilityBand(product.availability, band.value),
              ).length
              return (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => setSelectedAvailabilityBand(band.value)}
                  aria-pressed={band.value === selectedAvailabilityBand}
                  className={
                    band.value === selectedAvailabilityBand
                      ? 'chip is-active'
                      : 'chip'
                  }
                >
                  <span>{band.label}</span>
                  <span className="chip-count">{count}</span>
                </button>
              )
            })}
          </div>

          {hasActiveFilter ? (
            <button
              type="button"
              className="header-chip mt-4"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          ) : null}
        </aside>

        <div>
          <div className="shop-toolbar reveal-in">
            <p>{visibleProducts.length} products</p>

            <div className="shop-toolbar__actions">
              <button
                type="button"
                className="header-chip lg:hidden"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal size={13} />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden text-sm font-semibold text-(--ink-soft) sm:inline">
                  Sort by
                </span>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortOption)}
                  options={SORT_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                  aria-label="Sort products"
                />
              </div>

              {hasActiveFilter ? (
                <button
                  type="button"
                  className="header-chip"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          {hasActiveFilter ? (
            <div className="active-filters reveal-in">
              {activeCategory !== ALL_LABEL ? (
                <button
                  type="button"
                  className="active-filter"
                  onClick={() => navigateToCategory(ALL_LABEL)}
                >
                  Category: {activeCategory}
                  <X size={10} aria-hidden="true" />
                </button>
              ) : null}

              {hasPriceFilter ? (
                <button
                  type="button"
                  className="active-filter"
                  onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                >
                  Price: {formatPrice(priceRange[0])} -{' '}
                  {formatPrice(priceRange[1])}
                  <X size={10} aria-hidden="true" />
                </button>
              ) : null}

              {selectedMaterialBands.map((band) => (
                <button
                  key={band}
                  type="button"
                  className="active-filter"
                  onClick={() => toggleMaterial(band)}
                >
                  Material: {materialLabel(band)}
                  <X size={10} aria-hidden="true" />
                </button>
              ))}

              {selectedAvailabilityBand !== 'all' ? (
                <button
                  type="button"
                  className="active-filter"
                  onClick={() => setSelectedAvailabilityBand('all')}
                >
                  Availability: {availabilityLabel(selectedAvailabilityBand)}
                  <X size={10} aria-hidden="true" />
                </button>
              ) : null}

              <button
                type="button"
                className="active-filter active-filter--clear"
                onClick={resetFilters}
              >
                Clear all
              </button>
            </div>
          ) : null}

          {visibleProducts.length === 0 ? (
            <div className="empty-state reveal-in">
              <h3>No products match your filters</h3>
              <p>
                Try changing category, price, or material to discover more
                options.
              </p>
              <button
                type="button"
                className="btn-muted"
                onClick={resetFilters}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <Link
                  key={product.slug}
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="product-card reveal-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="product-card__visual">
                    {product.salePrice ? (
                      <span className="sale-pill">Sale</span>
                    ) : null}
                    <SmartImage
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="product-meta">{product.category}</p>
                    <h3>{product.name}</h3>
                    <div className="product-card-stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={11}
                          className={
                            n <= Math.round(product.rating)
                              ? 'star-filled'
                              : 'star-empty'
                          }
                        />
                      ))}
                      <span className="star-count">({product.reviews})</span>
                    </div>
                    <p className="price-row">
                      {product.salePrice ? (
                        <span className="price-old">
                          {formatPrice(product.price)}
                        </span>
                      ) : null}
                      <span className="price-new">
                        {formatPrice(product.salePrice ?? product.price)}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {isFilterOpen ? (
        <div
          className="drawer-overlay"
          role="presentation"
          onClick={() => setIsFilterOpen(false)}
        >
          <aside
            className="drawer-panel drawer-panel--left"
            role="dialog"
            aria-label="Filter products"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <h2 className="flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h2>
              <button
                type="button"
                className="header-chip"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={15} />
              </button>
            </div>

            <p className="eyebrow mb-3">Category</p>
            <div className="shop-chips">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    navigateToCategory(item)
                    setIsFilterOpen(false)
                  }}
                  aria-pressed={item === activeCategory}
                  className={
                    item === activeCategory ? 'chip is-active' : 'chip'
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="eyebrow mb-3 mt-5">Price</p>
            <div className="price-slider">
              <p>
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </p>
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[0]}
                onChange={(event) => setMinPrice(Number(event.target.value))}
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[1]}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label="Maximum price"
              />
            </div>

            <p className="eyebrow mb-3 mt-5">Material</p>
            <div className="check-stack">
              {MATERIAL_BANDS.map((band) => {
                if (band.value === 'all') {
                  return null
                }
                const count = categoryScopedProducts.filter((product) =>
                  matchesMaterialBand(product.material, band.value),
                ).length
                return (
                  <label
                    key={band.value}
                    className={
                      selectedMaterialBands.includes(band.value)
                        ? 'check-row is-active'
                        : 'check-row'
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterialBands.includes(band.value)}
                      onChange={() => toggleMaterial(band.value)}
                    />
                    <span>{band.label}</span>
                    <span className="chip-count">{count}</span>
                  </label>
                )
              })}
            </div>

            <p className="eyebrow mb-3 mt-5">Availability</p>
            <div className="shop-chips">
              {AVAILABILITY_BANDS.map((band) => {
                const count = categoryScopedProducts.filter((product) =>
                  matchesAvailabilityBand(product.availability, band.value),
                ).length
                return (
                  <button
                    key={band.value}
                    type="button"
                    onClick={() => setSelectedAvailabilityBand(band.value)}
                    aria-pressed={band.value === selectedAvailabilityBand}
                    className={
                      band.value === selectedAvailabilityBand
                        ? 'chip is-active'
                        : 'chip'
                    }
                  >
                    <span>{band.label}</span>
                    <span className="chip-count">{count}</span>
                  </button>
                )
              })}
            </div>

            {hasActiveFilter ? (
              <button
                type="button"
                className="header-chip mt-5"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}

      <div className="shop-mobile-bar lg:hidden">
        <button
          type="button"
          className="btn-muted inline-flex items-center gap-2"
          onClick={() => setIsFilterOpen(true)}
        >
          <SlidersHorizontal size={14} />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>

        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
          options={SORT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          aria-label="Sort products"
        />
      </div>
    </main>
  )
}
