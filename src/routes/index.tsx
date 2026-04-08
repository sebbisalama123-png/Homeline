import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { useCurrency } from '../components/CurrencyProvider'
import SmartImage from '../components/SmartImage'
import { roomCollections } from '../data/catalog'
import { getAllProducts } from '../lib/sanity/queries'

export const Route = createFileRoute('/')({
  loader: () => getAllProducts(),
  component: App,
})

function App() {
  const { formatPrice } = useCurrency()
  const products = Route.useLoaderData() as import('../lib/sanity/types').SanityProduct[]

  return (
    <main className="pb-8">
      {/* ── Full-bleed hero ── */}
      <section className="hero-full reveal-in">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=80"
          alt="Warm, modern Ugandan living room interior"
          className="hero-full__bg"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero-full__overlay" />

        <div className="hero-full__content page-wrap px-4 sm:px-8">
          <div className="hero-full__inner">
            <p className="hero-full__eyebrow">New Season Collection</p>
            <h1 className="hero-full__title">
              Furniture that makes<br className="hidden sm:block" /> your home feel designed,<br className="hidden sm:block" /> not decorated.
            </h1>
            <p className="hero-full__sub">
              Handcrafted pieces for living, dining, and bedroom spaces —<br className="hidden md:block" />
              built in Kampala for the way Ugandans actually live.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/shop" className="hero-full__btn-primary no-underline">
                Shop the Collection
              </Link>
              <Link to="/about" className="hero-full__btn-ghost no-underline">
                Our Story
              </Link>
            </div>
          </div>

          {/* floating product card */}
          <div className="hero-full__card">
            <p className="eyebrow mb-1" style={{ color: '#a07850' }}>Featured</p>
            <p className="m-0 text-xl font-semibold text-(--ink)">The Camden Sofa</p>
            <p className="mt-1.5 text-sm text-(--ink-soft)">
              Deep-seated comfort in textured bouclé. Available in 8 shades.
            </p>
            <p className="mt-3 text-sm font-semibold text-(--ink)">
              From {formatPrice(4600000)}
            </p>
            <Link
              to="/products/$slug"
              params={{ slug: 'marlow-cloud-sofa' }}
              className="hero-full__card-cta no-underline inline-flex items-center gap-1.5 mt-3"
            >
              View product <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* trust strip */}
        <div className="hero-full__strip">
          <div className="page-wrap px-4 sm:px-8">
            <div className="hero-full__strip-inner">
              {(['Free delivery in Kampala on orders over UGX 1.5M', 'Kiln-dried hardwood frames', 'Made to order in Kampala'] as const).map((item) => (
                <span key={item} className="hero-full__strip-item">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrap px-4">
      <section className="mt-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title m-0">Shop by Category</h2>
          <Link to="/shop" className="section-link">
            View all collections <ArrowRight size={13} />
          </Link>
        </div>
        <div className="cat-circle-grid">
          {roomCollections.map((room, index) => (
            <Link
              key={room.slug}
              to="/shop/$category"
              params={{ category: room.slug }}
              className="cat-circle reveal-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="cat-circle__ring">
                <img src={room.image} alt={room.name} loading="lazy" />
              </div>
              <span className="cat-circle__name">{room.name}</span>
              <span className="cat-circle__arrow">
                <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title m-0">Featured Picks</h2>
          <Link to="/shop" className="section-link">
            Browse all products <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...products].sort((a, b) => b.rating - a.rating).slice(0, 8).map((product, index) => (
            <Link
              key={product.name}
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="product-card reveal-in"
              style={{ animationDelay: `${index * 70}ms` }}
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
                <span className="product-card__quick-view">Quick View</span>
              </div>
              <div className="p-4">
                <h3>{product.name}</h3>
                <div className="product-card-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={11}
                      className={n <= Math.round(product.rating) ? 'star-filled' : 'star-empty'}
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
      </section>

      <section className="trust-band mt-14 grid gap-6 rounded-3xl p-6 sm:grid-cols-3 sm:p-8">
        {([
          {
            icon: <ShieldCheck size={22} />,
            title: 'Built to Last',
            text: 'Kiln-dried hardwood frames and commercial-grade upholstery rated for years of daily use.',
          },
          {
            icon: <Truck size={22} />,
            title: 'Delivery & Assembly',
            text: 'Free delivery in Kampala on orders over UGX 1,500,000. White-glove assembly available.',
          },
          {
            icon: <Sparkles size={22} />,
            title: 'Style Guidance',
            text: 'In-showroom and remote consultations with our Kampala design team.',
          },
        ] as const).map(({ icon, title, text }) => (
          <article key={title} className="trust-item">
            <div className="trust-item__icon">{icon}</div>
            <h3 className="m-0 text-base font-semibold text-(--ink)">{title}</h3>
            <p className="m-0 text-sm leading-6 text-(--ink-soft)">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-14 grid gap-5 lg:grid-cols-2">
        <article className="editorial-card">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
            alt="Handcrafted Ugandan sofa in a warm living room"
            className="editorial-card__img"
            loading="lazy"
          />
          <div className="editorial-card__overlay" />
          <div className="editorial-card__body">
            <p className="eyebrow">Our Story</p>
            <h3>Crafted in Kampala for Ugandan homes</h3>
            <Link to="/about" className="editorial-card__cta no-underline">
              Read our story <ArrowRight size={13} />
            </Link>
          </div>
        </article>
        <article className="editorial-card">
          <img
            src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80"
            alt="Contemporary dining furniture with natural wood"
            className="editorial-card__img"
            loading="lazy"
          />
          <div className="editorial-card__overlay" />
          <div className="editorial-card__body">
            <p className="eyebrow">Shop</p>
            <h3>Natural materials, contemporary form — explore the collection</h3>
            <Link to="/shop" className="editorial-card__cta no-underline">
              Browse all products <ArrowRight size={13} />
            </Link>
          </div>
        </article>
      </section>
      </div>{/* end page-wrap */}
    </main>
  )
}
