"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/format";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  totalKobo: number;
};

export function CustomerOrdersAccordion({
  name,
  email,
  phone,
  joinedLabel,
  paidCount,
  vip,
  orders,
}: {
  name: string;
  email: string;
  phone: string | null;
  joinedLabel: string;
  paidCount: number;
  vip: boolean;
  orders: OrderRow[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className={`customer-accordion${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="customer-accordion-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl leading-tight">{name}</h2>
            {paidCount > 0 && (
              <span className="customer-open-count">
                {paidCount} open
              </span>
            )}
            {vip && <span className="customer-vip-pill">VIP</span>}
          </div>
          {open && (
            <>
              <p className="mt-2 text-sm text-muted">
                {email}
                {phone ? ` · ${phone}` : ""}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                Joined {joinedLabel}
              </p>
            </>
          )}
        </div>
        <span className={`customer-accordion-chevron${open ? " is-open" : ""}`} aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-4">
          {orders.length > 0 ? (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-magenta hover:underline">
                    {o.orderNumber}
                  </Link>
                  <OrderStatusBadge status={o.status} />
                  <span className="font-medium">{formatNaira(o.totalKobo)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pt-4 text-sm text-muted">No open paid orders.</p>
          )}
        </div>
      )}
    </article>
  );
}
