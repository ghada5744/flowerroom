"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "best", label: "Best Selling" },
  { id: "az", label: "Alphabetically: A-Z" },
  { id: "za", label: "Alphabetically: Z-A" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "new", label: "Date: New to Old" },
  { id: "old", label: "Date: Old to New" },
];

export function ShopSort() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") || "featured";
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const label = OPTIONS.find((option) => option.id === current)?.label ?? "Featured";

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function choose(id: string) {
    const next = new URLSearchParams(params.toString());
    if (id === "featured") next.delete("sort");
    else next.set("sort", id);
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  return (
    <div className="shop-sort" ref={box}>
      <button type="button" className="shop-sort-btn" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>{label}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
          <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      {open && (
        <ul className="shop-sort-menu" role="listbox">
          {OPTIONS.map((option) => {
            const selected = option.id === current;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? "is-active" : undefined}
                  onClick={() => choose(option.id)}
                >
                  <span>{option.label}</span>
                  <span className="shop-sort-radio" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
