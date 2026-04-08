import { Link } from '@tanstack/react-router'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-20 px-4 pb-12 pt-12 text-(--ink-soft)">
      <div className="page-wrap grid gap-10 md:grid-cols-4">
        <div>
          <p className="brand-mark m-0 text-(--ink)">
            <span className="brand-mark__dot" />
            Hearth & Timber
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6">
            Crafted furniture for warm, modern Ugandan interiors. Every piece
            built to last a lifetime.
          </p>
        </div>

        <div>
          <p className="footer-heading">Shop</p>
          <ul className="footer-list">
            <li>
              <Link to="/shop">All Furniture</Link>
            </li>
            <li>
              <Link to="/shop/$category" params={{ category: 'living-room' }}>
                Living Room
              </Link>
            </li>
            <li>
              <Link to="/shop/$category" params={{ category: 'dining' }}>
                Dining
              </Link>
            </li>
            <li>
              <Link to="/shop/$category" params={{ category: 'bedroom' }}>
                Bedroom
              </Link>
            </li>
            <li>
              <Link to="/shop/$category" params={{ category: 'home-office' }}>
                Home Office
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer-heading">Help</p>
          <ul className="footer-list">
            <li>
              <Link to="/orders">Track Your Order</Link>
            </li>
            <li>
              <Link to="/about">Our Story</Link>
            </li>
            <li>
              <a
                href="https://wa.me/256704579980"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Support
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer-heading">Contact</p>
          <ul className="footer-list mt-3 grid gap-3">
            <li>
              <span className="footer-contact-item">
                <Phone size={14} />
                +256 704 579980
              </span>
            </li>
            <li>
              <span className="footer-contact-item">
                <Mail size={14} />
                studio@hearthandtimber.ug
              </span>
            </li>
            <li>
              <span className="footer-contact-item">
                <MapPin size={14} />
                Plot 12, Kololo, Kampala
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="page-wrap mt-10 flex flex-col gap-2 border-t border-(--line) pt-6 text-xs font-medium tracking-[0.06em] sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0">
          &copy; {year} Hearth & Timber Uganda. All rights reserved.
        </p>
        <p className="m-0 text-(--ink-soft)">Designed & built in Kampala</p>
      </div>
    </footer>
  )
}
