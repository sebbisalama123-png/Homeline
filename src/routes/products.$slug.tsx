import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Maximize2,
  Ruler,
  Star,
  Layers,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { useCart } from '../components/CartProvider'
import { useCurrency } from '../components/CurrencyProvider'
import { useToast } from '../components/ToastProvider'
import SmartImage from '../components/SmartImage'
import type { SanityProduct } from '../lib/sanity/types'
import { getAllProducts, getProductBySlug } from '../lib/sanity/queries'

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={14}
            className={n <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          />
        ))}
      </span>
      <span className="text-sm text-(--ink-soft)">
        {rating.toFixed(1)} ({reviews} reviews)
      </span>
    </div>
  )
}

type ProductLoaderData = {
  product: SanityProduct
  allProducts: SanityProduct[]
}

export const Route = createFileRoute('/products/$slug')({
  head: ({ loaderData }) => {
    const data = loaderData as ProductLoaderData | undefined
    return {
      meta: [
        {
          title: data
            ? `${data.product.name} | Homeline Furniture Uganda`
            : 'Product | Homeline Furniture Uganda',
        },
        {
          name: 'description',
          content:
            data?.product.shortDescription ??
            'Handcrafted furniture for Ugandan homes.',
        },
      ],
    }
  },
  component: ProductDetailPage,
  loader: async ({ params }): Promise<ProductLoaderData> => {
    const [product, allProducts] = await Promise.all([
      getProductBySlug(params.slug),
      getAllProducts(),
    ])
    if (!product) {
      throw notFound()
    }
    return { product, allProducts }
  },
})

function ProductDetailPage() {
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()
  const { toast } = useToast()
  const { product, allProducts } = Route.useLoaderData() as ProductLoaderData
  const displayPrice = product.salePrice ?? product.price
  const gallery: string[] =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image, product.image, product.image]
  const [activeImage, setActiveImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const previewImages = gallery
    .map((image, index) => ({ image, index }))
    .filter((item) => item.index !== activeImage)

  useEffect(() => {
    setActiveImage(0)
    setIsLightboxOpen(false)
  }, [product.slug])

  useEffect(() => {
    if (!isLightboxOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false)
      }
      if (event.key === 'ArrowLeft') {
        setActiveImage((current) =>
          current === 0 ? gallery.length - 1 : current - 1,
        )
      }
      if (event.key === 'ArrowRight') {
        setActiveImage((current) => (current + 1) % gallery.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gallery.length, isLightboxOpen])

  const related = allProducts
    .filter(
      (item) =>
        item.category === product.category && item.slug !== product.slug,
    )
    .slice(0, 3)

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <div className="pdp-breadcrumb mb-4 text-sm text-(--ink-soft)">
        <Link to="/shop" className="section-link">
          Shop
        </Link>{' '}
        / <span>{product.category}</span> / <span>{product.name}</span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="product-gallery reveal-in">
          <div className="product-gallery__hero">
            <button
              type="button"
              className="product-gallery__hero-btn"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Open image in full view"
            >
              <SmartImage
                src={gallery[activeImage]}
                alt={`${product.name} image ${activeImage + 1}`}
                loading="eager"
              />
            </button>
          </div>
          {previewImages.length > 0 ? (
            <div className="product-gallery__thumbs">
              {previewImages.map(({ image, index }) => (
                <button
                  key={image + String(index)}
                  type="button"
                  className="product-gallery__thumb"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <SmartImage
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="product-panel reveal-in pdp-panel">
          <div className="pdp-head">
            <p className="product-meta">{product.category}</p>
            <h1 className="display-title m-0 text-4xl sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} reviews={product.reviews} />
              <span
                className={`avail-badge ${
                  product.availability === 'In Stock'
                    ? 'avail-badge--in-stock'
                    : 'avail-badge--made-to-order'
                }`}
              >
                {product.availability === 'In Stock' ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <Clock size={11} />
                )}
                {product.availability}
              </span>
            </div>
          </div>

          <div className="pdp-pricing-card">
            <p className="price-row mt-0">
              {product.salePrice ? (
                <span className="price-old">{formatPrice(product.price)}</span>
              ) : null}
              <span className="price-new text-2xl">
                {formatPrice(displayPrice)}
              </span>
            </p>
            <p className="pdp-tax-note">Inclusive of VAT where applicable.</p>

            <div className="sticky-actions">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  addItem(product)
                  toast({
                    title: 'Added to cart',
                    description: product.name,
                    variant: 'success',
                  })
                }}
              >
                Add to Cart
              </button>
              <a
                href="https://wa.me/256704579980"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-muted w-full text-center no-underline"
              >
                Talk to Sales on WhatsApp
              </a>
            </div>
          </div>

          <div className="pdp-policy-grid">
            <article>
              <div className="spec-icon-row">
                <Truck size={13} /> Delivery
              </div>
              <p>Free in Kampala over UGX 1,500,000.</p>
            </article>
            <article>
              <div className="spec-icon-row">
                <RotateCcw size={13} /> Returns
              </div>
              <p>7-day return support on eligible items.</p>
            </article>
            <article>
              <div className="spec-icon-row">
                <ShieldCheck size={13} /> Warranty
              </div>
              <p>Structural warranty included by default.</p>
            </article>
          </div>
        </aside>
      </section>

      <section className="pdp-detail-grid mt-8 reveal-in">
        <article className="pdp-copy-card">
          <h2 className="section-title m-0 text-3xl sm:text-4xl">
            Product details
          </h2>
          <p className="mt-3 text-(--ink-soft)">{product.description}</p>
          <p className="mt-3 text-sm text-(--ink-soft)">
            SKU: HT-{product.slug.toUpperCase()}
          </p>
        </article>

        <article className="pdp-spec-card">
          <h2>Specifications</h2>
          <div className="spec-grid mt-4">
            <article>
              <div className="spec-icon-row">
                <Layers size={13} /> Material
              </div>
              <p>{product.material}</p>
            </article>
            <article>
              <div className="spec-icon-row">
                <Ruler size={13} /> Dimensions
              </div>
              <p>{product.dimensions}</p>
            </article>
            <article>
              <div className="spec-icon-row">
                <Clock size={13} /> Lead Time
              </div>
              <p>{product.leadTime}</p>
            </article>
          </div>
        </article>
      </section>

      <div className="product-mobile-bar">
        <div>
          <p className="m-0 text-xs text-(--ink-soft)">Price</p>
          <p className="m-0 font-bold">{formatPrice(displayPrice)}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
                  addItem(product)
                  toast({
                    title: 'Added to cart',
                    description: product.name,
                    variant: 'success',
                  })
                }}
        >
          Add to Cart
        </button>
      </div>

      {related.length > 0 ? (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="section-title m-0">You may also like</h2>
            <Link to="/shop" className="section-link">
              View more
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item: SanityProduct) => (
              <Link
                key={item.slug}
                to="/products/$slug"
                params={{ slug: item.slug }}
                className="product-card"
              >
                <div className="product-card__visual">
                  <SmartImage src={item.image} alt={item.name} loading="lazy" />
                </div>
                <div className="p-4">
                  <h3>{item.name}</h3>
                  <p className="price-row mt-2">
                    <span className="price-new">
                      {formatPrice(item.salePrice ?? item.price)}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {isLightboxOpen ? (
        <div
          className="lightbox-overlay"
          role="presentation"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} image preview`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close inline-flex items-center gap-1.5"
              onClick={() => setIsLightboxOpen(false)}
            >
              <Maximize2 size={13} /> Close
            </button>

            <div className="lightbox-main">
              <SmartImage
                src={gallery[activeImage]}
                alt={`${product.name} full view ${activeImage + 1}`}
                loading="eager"
              />
            </div>

            <div className="lightbox-controls">
              <button
                type="button"
                className="btn-muted"
                onClick={() =>
                  setActiveImage((current) =>
                    current === 0 ? gallery.length - 1 : current - 1,
                  )
                }
              >
                Previous
              </button>
              <p>
                {activeImage + 1} / {gallery.length}
              </p>
              <button
                type="button"
                className="btn-muted"
                onClick={() =>
                  setActiveImage((current) => (current + 1) % gallery.length)
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
