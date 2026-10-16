import Link from "next/link";
import { SHOP_ADDRESS_SHORT, SHOP_MAPS_URL } from "@/lib/location";

type Settings = {
  brandName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
};

function formatWhatsAppDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  // 2349155353128 → +234 915 535 3128
  if (digits.length === 13 && digits.startsWith("234")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export function Footer({ settings }: { settings: Settings }) {
  const waDigits = settings.whatsapp.replace(/\D/g, "");
  const waDisplay = formatWhatsAppDisplay(settings.whatsapp);

  return (
    <footer className="mt-auto border-t border-line bg-[#faf6ef]">
      <div className="border-b border-line bg-[#f3eee6] py-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">We Have Your Back</h2>
        <p className="mt-2 text-sm text-muted">Get in touch on any of our support channels</p>
        <div className="mx-auto mt-7 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase">Email</p>
            <a href={`mailto:${settings.email}`} className="mt-2 block text-sm font-medium hover:text-magenta">
              {settings.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase">WhatsApp</p>
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-sm font-medium hover:text-magenta"
            >
              {waDisplay}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase">Visit us</p>
            <a
              href={SHOP_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-sm font-medium hover:text-magenta"
            >
              {SHOP_ADDRESS_SHORT}
            </a>
          </div>
        </div>
      </div>

      <div className="site-wrap py-12">
        <div className="footer-brand mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-[1.5rem] font-semibold tracking-[0.12em]">{settings.brandName}</p>
            <p className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#666]">{settings.tagline}</p>
          </div>
          <div className="footer-socials">
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
              </svg>
            </a>
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5A4.5 4.5 0 1112 16.5 4.5 4.5 0 0112 7.5zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 9.5zM17.5 6.2a1 1 0 11-1 1 1 1 0 011-1z" />
              </svg>
            </a>
            <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19.6 7.8a6.5 6.5 0 01-3.8-1.2v7.2a5.6 5.6 0 11-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 102 2.7V2.5h2.7a3.8 3.8 0 003.8 3.8v1.5z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <details className="footer-acc">
            <summary>
              <span>Flower Room</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>
                <Link href="/" className="hover:text-magenta">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-magenta">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" className="hover:text-magenta">
                  How To Order
                </Link>
              </li>
              <li>
                <Link href="/flower-care" className="hover:text-magenta">
                  Flower Care
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-magenta">
                  Contact Us
                </Link>
              </li>
            </ul>
          </details>
          <details className="footer-acc">
            <summary>
              <span>Delivery</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>Lagos Island</li>
              <li>Lagos Mainland</li>
              <li>Lekki</li>
              <li>Victoria Island</li>
              <li>Ikeja</li>
              <li>Same-day Lagos</li>
            </ul>
          </details>
          <details className="footer-acc">
            <summary>
              <span>Info</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>
                <Link href="/account" className="hover:text-magenta">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" className="hover:text-magenta">
                  How To Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-magenta">
                  Customer Service
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-magenta">
                  Flower FAQ&apos;s
                </Link>
              </li>
            </ul>
          </details>
          <details className="footer-acc">
            <summary>
              <span>Services</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>
                <Link href="/shop/events-bridal" className="hover:text-magenta">
                  Wedding Flowers
                </Link>
              </li>
              <li>
                <Link href="/shop/events-bridal" className="hover:text-magenta">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/shop/plants" className="hover:text-magenta">
                  Flowers For Your Home
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-magenta">
                  Bespoke Flowers
                </Link>
              </li>
            </ul>
          </details>
          <details className="footer-acc">
            <summary>
              <span>Occasion</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>
                <Link href="/shop/gift-sets" className="hover:text-magenta">
                  Birthday
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-sets" className="hover:text-magenta">
                  Anniversary
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-sets" className="hover:text-magenta">
                  Congratulations
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-sets" className="hover:text-magenta">
                  Apology
                </Link>
              </li>
              <li>
                <Link href="/shop/events-bridal" className="hover:text-magenta">
                  Sympathy
                </Link>
              </li>
            </ul>
          </details>
          <details className="footer-acc">
            <summary>
              <span>Collection</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>
                <Link href="/shop/hand-tied-bouquets" className="hover:text-magenta">
                  Hand-tied
                </Link>
              </li>
              <li>
                <Link href="/shop/signature-arrangements" className="hover:text-magenta">
                  Hatbox
                </Link>
              </li>
              <li>
                <Link href="/shop/signature-arrangements" className="hover:text-magenta">
                  Basket
                </Link>
              </li>
              <li>
                <Link href="/shop/sweet-savoury" className="hover:text-magenta">
                  Treats
                </Link>
              </li>
              <li>
                <Link href="/shop/plants" className="hover:text-magenta">
                  Plants
                </Link>
              </li>
            </ul>
          </details>
          <details className="footer-acc">
            <summary>
              <span>Upcoming</span>
              <span className="footer-acc-icon" aria-hidden />
            </summary>
            <ul>
              <li>Mother&apos;s Day</li>
              <li>Valentine&apos;s Day</li>
              <li>Graduation</li>
              <li>Eid Flowers</li>
            </ul>
          </details>
        </div>
      </div>

      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Flower Room NG · Victoria Island, Lagos · All rights reserved
      </div>
    </footer>
  );
}
