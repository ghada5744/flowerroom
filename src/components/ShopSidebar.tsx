"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Cat = { name: string; slug: string };

type NavChild = {
  href: string;
  label: string;
  match?: Record<string, string>;
  children?: NavChild[];
};
type NavLink = { type: "link"; href: string; label: string };
type NavGroup = {
  type: "group";
  id: string;
  label: string;
  children: NavChild[];
};
type NavItem = NavLink | NavGroup;

function typeChild(category: string, type: string, label: string): NavChild {
  return { href: `/shop/${category}?type=${type}`, label, match: { type } };
}

function buildNav(categories: Cat[]): NavItem[] {
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const items: NavItem[] = [{ type: "link", href: "/shop", label: "Shop all" }];

  if (bySlug["hand-tied-bouquets"]) {
    items.push({
      type: "group",
      id: "bouquets",
      label: bySlug["hand-tied-bouquets"].name,
      children: [
        typeChild("hand-tied-bouquets", "mixed", "Mixed Bouquets"),
        {
          ...typeChild("hand-tied-bouquets", "roses", "Roses"),
          children: (["red", "pink", "white"] as const).map((color) => ({
            href: `/shop/hand-tied-bouquets?type=roses&color=${color}`,
            label: color[0].toUpperCase() + color.slice(1),
            match: { type: "roses", color },
          })),
        },
      ],
    });
  }

  items.push({
    type: "group",
    id: "occasion",
    label: "Shop by Occasion",
    children: [
      {
        href: "/shop/gift-sets?occasion=birthday",
        label: "Birthday",
        match: { occasion: "birthday" },
      },
      {
        href: "/shop/gift-sets?occasion=anniversary",
        label: "Anniversary",
        match: { occasion: "anniversary" },
      },
      {
        href: "/shop/gift-sets?occasion=congratulations",
        label: "Congratulations",
        match: { occasion: "congratulations" },
      },
      {
        href: "/shop/gift-sets?occasion=apology",
        label: "Apology",
        match: { occasion: "apology" },
      },
    ],
  });

  if (bySlug["signature-arrangements"]) {
    items.push({
      type: "group",
      id: "signature",
      label: bySlug["signature-arrangements"].name,
      children: [
        typeChild("signature-arrangements", "baskets", "Baskets"),
        typeChild("signature-arrangements", "giant-vases", "Giant Vases"),
        typeChild("signature-arrangements", "standing-bouquets", "Standing Bouquets"),
        typeChild("signature-arrangements", "hat-boxes", "Hat Boxes"),
      ],
    });
  }

  for (const slug of ["events-bridal", "sweet-savoury", "plants"] as const) {
    const cat = bySlug[slug];
    if (!cat) continue;
    items.push({
      type: "link",
      href: `/shop/${cat.slug}`,
      label: slug === "sweet-savoury" ? "Add-ons" : cat.name,
    });
  }

  return items;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`shop-sidebar-chevron${open ? " is-open" : ""}`}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      aria-hidden
    >
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function pathOnly(href: string) {
  return href.split("?")[0];
}

function isActivePath(pathname: string, href: string) {
  const path = pathOnly(href);
  return pathname === path || (path !== "/shop" && pathname.startsWith(path));
}

function isChildActive(pathname: string, searchParams: URLSearchParams, child: NavChild) {
  if (child.children?.some((c) => isChildActive(pathname, searchParams, c))) return true;
  if (child.match) {
    return (
      isActivePath(pathname, child.href) &&
      Object.entries(child.match).every(([k, v]) => searchParams.get(k) === v)
    );
  }
  return isActivePath(pathname, child.href);
}

function ShopSidebarInner({ categories }: { categories: Cat[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = buildNav(categories);

  const initiallyOpen = items.reduce<Record<string, boolean>>((acc, item) => {
    if (item.type === "group") {
      acc[item.id] = item.children.some((c) => isChildActive(pathname, searchParams, c));
    }
    return acc;
  }, {});

  const [open, setOpen] = useState<Record<string, boolean>>(initiallyOpen);

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (item.type === "group" && item.children.some((c) => isChildActive(pathname, searchParams, c))) {
          next[item.id] = true;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reopen when route / query changes
  }, [pathname, searchParams]);

  return (
    <aside className="shop-sidebar">
      <ul className="shop-sidebar-list">
        {items.map((item) => {
          if (item.type === "link") {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href} className="shop-sidebar-item">
                <Link href={item.href} className={active ? "is-active" : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          }

          const isOpen = Boolean(open[item.id]);
          return (
            <li
              key={item.id}
              className={`shop-sidebar-item shop-sidebar-item--group${isOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="shop-sidebar-toggle"
                aria-expanded={isOpen}
                onClick={() => setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              >
                <span>{item.label}</span>
                <Chevron open={isOpen} />
              </button>
              {isOpen && (
                <ul className="shop-sidebar-sub">
                  {item.children.map((child) => {
                    const active = isChildActive(pathname, searchParams, child);
                    return (
                      <li key={`${item.id}-${child.label}`}>
                        <Link href={child.href} className={active ? "is-active" : undefined}>
                          {child.label}
                        </Link>
                        {child.children && (
                          <ul className="shop-sidebar-sub shop-sidebar-sub--nested">
                            {child.children.map((sub) => (
                              <li key={`${item.id}-${child.label}-${sub.label}`}>
                                <Link
                                  href={sub.href}
                                  className={
                                    isChildActive(pathname, searchParams, sub) ? "is-active" : undefined
                                  }
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/** Sidebar = categories + flowers.ae-style accordion dropdowns */
export function ShopSidebar({ categories }: { categories: Cat[] }) {
  return (
    <Suspense fallback={<aside className="shop-sidebar" aria-hidden />}>
      <ShopSidebarInner categories={categories} />
    </Suspense>
  );
}
