"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Cat = { id: string; name: string; slug: string; parentId?: string | null };

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
  /** The group's own page (opening it keeps the dropdown open) */
  href?: string;
  children: NavChild[];
};
type NavItem = NavLink | NavGroup;

const SHORT_LABELS: Record<string, string> = { "sweet-savoury": "Add-ons" };

/** "Red Roses" under "Roses" → "Red" */
function childLabel(child: Cat, parent: Cat) {
  const suffix = ` ${parent.name}`;
  return child.name.endsWith(suffix) ? child.name.slice(0, -suffix.length) : child.name;
}

function buildNav(categories: Cat[]): NavItem[] {
  const childrenOf = (id: string | null) => categories.filter((c) => (c.parentId ?? null) === id);

  const toChild = (c: Cat, parent: Cat): NavChild => {
    const kids = childrenOf(c.id);
    return {
      href: `/shop/${c.slug}`,
      label: childLabel(c, parent),
      ...(kids.length ? { children: kids.map((k) => toChild(k, c)) } : {}),
    };
  };

  const occasion: NavGroup = {
    type: "group",
    id: "occasion",
    label: "Shop by Occasion",
    children: (["birthday", "anniversary", "congratulations", "apology"] as const).map((o) => ({
      href: `/shop/gift-sets?occasion=${o}`,
      label: o[0].toUpperCase() + o.slice(1),
      match: { occasion: o },
    })),
  };

  const items: NavItem[] = [{ type: "link", href: "/shop", label: "Shop all" }];
  let occasionAdded = false;

  for (const c of childrenOf(null)) {
    // Gift sets are reached through "Shop by Occasion"
    if (c.slug === "gift-sets") continue;
    const kids = childrenOf(c.id);
    if (kids.length) {
      items.push({
        type: "group",
        id: c.id,
        label: c.name,
        href: `/shop/${c.slug}`,
        children: kids.map((k) => toChild(k, c)),
      });
    } else {
      items.push({ type: "link", href: `/shop/${c.slug}`, label: SHORT_LABELS[c.slug] ?? c.name });
    }
    if (c.slug === "hand-tied-bouquets") {
      items.push(occasion);
      occasionAdded = true;
    }
  }
  if (!occasionAdded) items.splice(1, 0, occasion);

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
  return pathname === path || (path !== "/shop" && pathname.startsWith(`${path}/`));
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

/** Which dropdowns should be open for the current page */
function activeOpenKeys(items: NavItem[], pathname: string, searchParams: URLSearchParams) {
  const keys: Record<string, boolean> = {};
  for (const item of items) {
    if (item.type !== "group") continue;
    if (
      (item.href && isActivePath(pathname, item.href)) ||
      item.children.some((c) => isChildActive(pathname, searchParams, c))
    ) {
      keys[item.id] = true;
    }
    for (const c of item.children) {
      if (c.children && isChildActive(pathname, searchParams, c)) keys[`${item.id}/${c.label}`] = true;
    }
  }
  return keys;
}

function ShopSidebarInner({ categories }: { categories: Cat[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = buildNav(categories);

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    activeOpenKeys(items, pathname, searchParams),
  );

  useEffect(() => {
    setOpen((prev) => ({ ...prev, ...activeOpenKeys(items, pathname, searchParams) }));
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
                        {child.children ? (
                          <div className="shop-sidebar-subrow">
                            <Link href={child.href} className={active ? "is-active" : undefined}>
                              {child.label}
                            </Link>
                            <button
                              type="button"
                              className="shop-sidebar-subtoggle"
                              aria-label={`Show ${child.label} options`}
                              aria-expanded={Boolean(open[`${item.id}/${child.label}`])}
                              onClick={() =>
                                setOpen((prev) => ({
                                  ...prev,
                                  [`${item.id}/${child.label}`]: !prev[`${item.id}/${child.label}`],
                                }))
                              }
                            >
                              <Chevron open={Boolean(open[`${item.id}/${child.label}`])} />
                            </button>
                          </div>
                        ) : (
                          <Link href={child.href} className={active ? "is-active" : undefined}>
                            {child.label}
                          </Link>
                        )}
                        {child.children && open[`${item.id}/${child.label}`] && (
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
