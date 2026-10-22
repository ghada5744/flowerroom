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

const FOOTER_COLUMNS: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Flower Room",
    items: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "How To Order", href: "/how-to-order" },
      { label: "Flower Care", href: "/flower-care" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Delivery",
    items: [
      { label: "Lagos Island" },
      { label: "Lagos Mainland" },
      { label: "Lekki" },
      { label: "Victoria Island" },
      { label: "Ikeja" },
      { label: "Same-day Lagos" },
    ],
  },
  {
    title: "Info",
    items: [
      { label: "My Account", href: "/account" },
      { label: "How To Order", href: "/how-to-order" },
      { label: "Customer Service", href: "/contact" },
      { label: "Flower FAQ's", href: "/#faqs" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Wedding Flowers", href: "/shop/events-bridal" },
      { label: "Events", href: "/shop/events-bridal" },
      { label: "Flowers For Your Home", href: "/shop/plants" },
      { label: "Bespoke Flowers", href: "/contact" },
    ],
  },
  {
    title: "Occasion",
    items: [
      { label: "Birthday", href: "/shop/gift-sets" },
      { label: "Anniversary", href: "/shop/gift-sets" },
      { label: "Congratulations", href: "/shop/gift-sets" },
      { label: "Apology", href: "/shop/gift-sets" },
      { label: "Sympathy", href: "/shop/events-bridal" },
    ],
  },
  {
    title: "Collection",
    items: [
      { label: "Hand-tied", href: "/shop/hand-tied-bouquets" },
      { label: "Hatbox", href: "/shop/signature-arrangements" },
      { label: "Basket", href: "/shop/signature-arrangements" },
      { label: "Treats", href: "/shop/sweet-savoury" },
      { label: "Plants", href: "/shop/plants" },
    ],
  },
  {
    title: "Upcoming",
    items: [
      { label: "Mother's Day" },
      { label: "Valentine's Day" },
      { label: "Graduation" },
      { label: "Eid Flowers" },
    ],
  },
];

function FooterItem({ item }: { item: { label: string; href?: string } }) {
  if (!item.href) return <li>{item.label}</li>;
  return (
    <li>
      <Link href={item.href} className="hover:text-magenta">
        {item.label}
      </Link>
    </li>
  );
}

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

        <div className="footer-links footer-links-desktop">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="mb-3 font-bold text-ink">{column.title}</p>
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <FooterItem key={item.label} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-links footer-links-mobile">
          {FOOTER_COLUMNS.map((column) => (
            <details key={column.title} className="footer-acc">
              <summary>
                <span>{column.title}</span>
                <span className="footer-acc-icon" aria-hidden />
              </summary>
              <ul>
                {column.items.map((item) => (
                  <FooterItem key={item.label} item={item} />
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>

      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Flower Room NG · Victoria Island, Lagos · All rights reserved
      </div>
    </footer>
  );
}
