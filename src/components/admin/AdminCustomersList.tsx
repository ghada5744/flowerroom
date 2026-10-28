"use client";

import { useMemo, useState } from "react";
import { CustomerOrdersAccordion } from "@/components/admin/CustomerOrdersAccordion";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  joinedLabel: string;
  paidCount: number;
  vip: boolean;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalKobo: number;
  }[];
};

export function AdminCustomersList({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const name = c.name.toLowerCase();
      const email = c.email.toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [customers, query]);

  return (
    <div className="mt-6">
      <div className="admin-customers-toolbar">
        <div className="admin-products-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
          <input
            id="customers-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search customers by name"
          />
        </div>
        <p className="admin-products-count">
          {filtered.length} of {customers.length}
          {query.trim() && (
            <button type="button" className="admin-products-clear" onClick={() => setQuery("")}>
              Clear
            </button>
          )}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((c) => (
          <CustomerOrdersAccordion
            key={c.id}
            id={c.id}
            name={c.name}
            email={c.email}
            phone={c.phone}
            joinedLabel={c.joinedLabel}
            paidCount={c.paidCount}
            vip={c.vip}
            orders={c.orders}
          />
        ))}
        {filtered.length === 0 && customers.length > 0 && (
          <div className="border border-dashed border-line bg-white px-4 py-12 text-center text-sm text-muted">
            No customer matches “{query.trim()}”
          </div>
        )}
        {customers.length === 0 && (
          <div className="border border-dashed border-line bg-white px-4 py-12 text-center text-sm text-muted">
            No customer accounts yet. They appear here when someone registers via Login on the site.
          </div>
        )}
      </div>
    </div>
  );
}
