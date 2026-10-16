"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";

const NAV = [
  { href: "/shop", label: "Our Complete Range" },
  { href: "/shop/hand-tied-bouquets", label: "Hand Tied Bouquets" },
  { href: "/shop/gift-sets", label: "Gift Sets" },
  { href: "/product/roses", label: "Roses" },
  { href: "/shop/signature-arrangements", label: "Signature Arrangements" },
];

type Settings = {
  brandName: string;
  tagline: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  bannerLeft: string;
  bannerCenter: string;
  bannerRight: string;
};

type CustomerUser = { id: string; name: string; email: string } | null;

export function Header({ settings }: { settings: Settings }) {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [user, setUser] = useState<CustomerUser>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#faf6ef]">
      {/* flowers.ae-style trust bar */}
      <div className="announce-bar">
        <div className="site-wrap announce-bar-inner">
          <span className="announce-item announce-item--left">
            <span className="announce-link">{settings.bannerLeft}</span>
          </span>
          <span className="announce-item announce-item--center">
            <span className="announce-link">{settings.bannerCenter}</span>
          </span>
          <span className="announce-item announce-item--right">
            <span className="announce-link">{settings.bannerRight}</span>
          </span>
        </div>
      </div>

      {/* Full-width separator above the category nav — not under the tagline */}
      <div className="border-b border-[#2e2e2e] bg-[#faf6ef]">
        <div className="site-wrap header-brand-row grid grid-cols-[auto_1fr_auto] items-center gap-2 pb-4 pt-3 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-3 md:pb-10 md:pt-7">
          <div className="flex flex-col items-start gap-2 pt-1">
            <div className="header-socials hidden sm:flex">
              <a href={settings.facebookUrl} aria-label="Facebook" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
                </svg>
              </a>
              <a href={settings.instagramUrl} aria-label="Instagram" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5A4.5 4.5 0 1112 16.5 4.5 4.5 0 0112 7.5zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 9.5zM17.5 6.2a1 1 0 11-1 1 1 1 0 011-1z" />
                </svg>
              </a>
              <a href={settings.tiktokUrl} aria-label="TikTok" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.6 7.8a6.5 6.5 0 01-3.8-1.2v7.2a5.6 5.6 0 11-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 102 2.7V2.5h2.7a3.8 3.8 0 003.8 3.8v1.5z" />
                </svg>
              </a>
            </div>
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="hidden text-[14px] text-[#333] hover:underline hover:underline-offset-2 sm:inline"
            >
              {settings.phone}
            </a>
            <button type="button" className="md:hidden text-ink" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>

          <Link href="/" className="brand-lockup text-center pt-0.5 no-underline hover:no-underline">
            <span className="font-display block text-[1.35rem] leading-none tracking-[0.12em] text-ink no-underline sm:text-[1.9rem] sm:tracking-[0.16em] md:text-[2.65rem]">
              {settings.brandName}
            </span>
            <span className="brand-tagline mt-1 text-[8px] tracking-[0.22em] text-[#333] uppercase no-underline sm:mt-2 sm:text-[10px] sm:tracking-[0.36em] md:text-[11px]">
              {settings.tagline}
            </span>
          </Link>

          <div className="flex flex-col items-end gap-3">
            <form onSubmit={onSearch} className="header-search hidden sm:flex">
              <input type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
              <button type="submit" aria-label="Search" className="text-[#111]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.2-3.2" />
                </svg>
              </button>
            </form>
            <div className="header-actions flex items-center gap-4 text-[12px] tracking-[0.08em] uppercase text-[#111]">
              <Link href={user ? "/account" : "/account/login"} className="inline-flex items-center gap-1.5 hover:text-magenta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
                </svg>
                <span className="hidden md:inline">{user ? "Account" : "Login"}</span>
              </Link>
              <Link href="/cart" className="relative inline-flex items-center gap-1.5 hover:text-magenta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 7h15l-1.4 9H7.2L6 7z" />
                  <path d="M6 7L5 3H2" />
                  <circle cx="9" cy="20" r="1.2" fill="currentColor" />
                  <circle cx="17" cy="20" r="1.2" fill="currentColor" />
                </svg>
                <span className="hidden md:inline">Cart</span>
                {mounted && count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-magenta px-1 text-[10px] text-white normal-case tracking-normal">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="header-cat-nav hidden bg-[#faf6ef] md:block">
        <ul className="site-wrap flex items-center justify-center gap-12 py-4 text-[16.5px] font-normal text-[#1a1a1a] no-underline md:text-[17px]">
          {NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="transition-colors hover:text-magenta hover:underline hover:underline-offset-4"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <div className="border-b border-line bg-white px-4 py-4 md:hidden">
          <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mb-3 block text-sm text-[#333] sm:hidden">
            {settings.phone}
          </a>
          <ul className="space-y-3 text-sm">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-1">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
