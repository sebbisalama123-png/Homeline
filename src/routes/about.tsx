import { Link, createFileRoute } from '@tanstack/react-router'
import { MapPin, MessageCircle, ShieldCheck, Truck } from 'lucide-react'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'Our Story | Hearth & Timber Uganda' },
      {
        name: 'description',
        content:
          'Hearth & Timber is a Uganda-based furniture studio crafting pieces built for real homes and real living.',
      },
    ],
  }),
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="hero-shell rounded-3xl p-6 sm:p-10">
        <p className="eyebrow mb-3">Our Story</p>
        <h1 className="display-title mb-4 text-4xl font-semibold text-(--ink) sm:text-6xl">
          Built for Ugandan homes. Designed to last.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-(--ink-soft)">
          Hearth & Timber was born out of a simple frustration — quality
          furniture in Uganda was either imported and overpriced, or locally
          made with no eye for design. We set out to change that. Every piece in
          our collection is crafted with natural materials, honest construction,
          and contemporary form that fits the way people in Uganda actually
          live.
        </p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-3">
        {(
          [
            {
              icon: <MapPin size={20} />,
              title: 'Crafted Locally',
              body: 'Our workshops are based in Kampala. We source timber and fabrics from within Uganda wherever possible, keeping money in the local economy and reducing lead times.',
            },
            {
              icon: <ShieldCheck size={20} />,
              title: 'Built to Last',
              body: 'We use kiln-dried hardwood frames, high-density foam, and commercial-grade fabrics rated for years of daily use. No shortcuts on structure.',
            },
            {
              icon: <Truck size={20} />,
              title: 'Delivered to Your Door',
              body: 'Free delivery on orders over UGX 1,500,000 within Kampala. White-glove assembly available. We call to confirm every order before dispatch.',
            },
          ] as const
        ).map(({ icon, title, body }) => (
          <article key={title} className="cart-page-panel reveal-in p-6">
            <div className="feature-card-icon">{icon}</div>
            <h3 className="m-0 text-lg font-semibold text-(--ink)">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-(--ink-soft)">{body}</p>
          </article>
        ))}
      </section>

      <section className="trust-band mt-10 grid gap-4 rounded-3xl p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="eyebrow mb-2">Visit Our Showroom</p>
          <h2 className="m-0 text-2xl font-semibold text-(--ink)">
            See it in person before you buy
          </h2>
          <p className="mt-3 text-sm leading-7 text-(--ink-soft)">
            Our Kampala showroom is open Monday to Saturday, 9am – 6pm. Walk in
            or book a private appointment for a guided tour of our current
            collection.
          </p>
          <Link
            to="/shop"
            className="btn-primary mt-4 inline-block no-underline"
          >
            Browse the Collection
          </Link>
        </div>
        <div>
          <p className="eyebrow mb-2">Get in Touch</p>
          <h2 className="m-0 text-2xl font-semibold text-(--ink)">
            We are happy to help
          </h2>
          <p className="mt-3 text-sm leading-7 text-(--ink-soft)">
            Questions about a product, custom orders, or delivery? Reach us on
            WhatsApp or email and we will respond within a few hours.
          </p>
          {/* Update the WhatsApp number below with your real number */}
          <a
            href="https://wa.me/256704579980"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-muted mt-4 inline-flex items-center gap-2 no-underline"
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  )
}
