"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { formatNaira } from "@/lib/format";

type ProductRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  active: boolean;
  category: { id: string; name: string };
  fromKobo: number;
};

export function ProductsFilterTable({
  products,
  sections,
}: {
  products: ProductRow[];
  sections: { id: string; name: string }[];
}) {
  const [nameQuery, setNameQuery] = useState("");
  const [sectionId, setSectionId] = useState("");

  const filtered = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (sectionId && p.category.id !== sectionId) return false;
      if (!q) return true;
      const name = p.name.toLowerCase();
      return name.startsWith(q) || name.includes(q);
    });
  }, [products, nameQuery, sectionId]);

  const active = Boolean(nameQuery.trim() || sectionId);

  return (
    <div className="mt-6">
      <div className="admin-products-toolbar">
        <div className="admin-products-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
          <input
            id="filter-name"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search products by name"
          />
        </div>

        <div className="admin-products-section">
          <select
            id="filter-section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            aria-label="Filter by section"
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <p className="admin-products-count">
          {filtered.length} of {products.length}
          {active && (
            <button
              type="button"
              className="admin-products-clear"
              onClick={() => {
                setNameQuery("");
                setSectionId("");
              }}
            >
              Clear
            </button>
          )}
        </p>
      </div>

      <div className="overflow-x-auto border border-line border-t-0 bg-white">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 overflow-hidden border border-line bg-cream">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.category.name}</td>
                <td className="px-4 py-3">{p.fromKobo === 0 ? "Enquire" : formatNaira(p.fromKobo)}</td>
                <td className="px-4 py-3">{p.active ? "Visible" : "Hidden"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/products/${p.id}`} className="text-xs uppercase tracking-wide text-ink hover:text-magenta">
                      Edit
                    </Link>
                    <ProductDeleteButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No products match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
