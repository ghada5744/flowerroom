"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/format";

type DeliveredOrder = {
  id: string;
  orderNumber: string;
  createdAtLabel: string;
  senderName: string;
  status: string;
  totalKobo: number;
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
      <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function DeliveredOrdersTable({ orders }: { orders: DeliveredOrder[] }) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const allIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const allSelected = orders.length > 0 && selected.size === orders.length;
  const someSelected = selected.size > 0 && !allSelected;
  const count = selected.size;

  function enterSelectMode() {
    setSelecting(true);
    setSelected(new Set());
  }

  function cancelSelectMode() {
    if (loading) return;
    setSelecting(false);
    setSelected(new Set());
    setConfirmOpen(false);
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/delivered", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not delete orders");
        setLoading(false);
        return;
      }
      setConfirmOpen(false);
      setSelecting(false);
      setSelected(new Set());
      setLoading(false);
      router.refresh();
    } catch {
      alert("Could not delete orders");
      setLoading(false);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="mt-6 border border-line bg-white px-4 py-8 text-center text-sm text-muted">
        No delivered orders yet
      </div>
    );
  }

  return (
    <>
      {!selecting ? (
        <div className="delivered-toolbar">
          <p className="delivered-toolbar-hint">Records of completed deliveries</p>
          <button type="button" className="delivered-trash-trigger" onClick={enterSelectMode}>
            <TrashIcon />
            <span>Delete</span>
          </button>
        </div>
      ) : (
        <div className="delivered-select-bar" role="region" aria-label="Delete delivered orders">
          <div className="delivered-select-copy">
            <p className="delivered-select-title">Select orders to remove</p>
            <p className="delivered-select-sub">
              {count === 0
                ? "Tick the ones you want, or select all."
                : `${count} order${count === 1 ? "" : "s"} ready to delete`}
            </p>
          </div>
          <div className="delivered-select-actions">
            <button type="button" className="delivered-select-all" onClick={toggleAll}>
              {allSelected ? "Clear all" : "Select all"}
            </button>
            <button type="button" className="btn-ghost delivered-cancel" onClick={cancelSelectMode}>
              Cancel
            </button>
            <button
              type="button"
              className="delivered-delete-go"
              disabled={count === 0}
              onClick={() => setConfirmOpen(true)}
            >
              <TrashIcon />
              <span>{count === 0 ? "Delete" : `Delete ${count}`}</span>
            </button>
          </div>
        </div>
      )}

      <div className={`mt-3 overflow-x-auto border border-line bg-white${selecting ? " delivered-table-selecting" : ""}`}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wider text-muted">
            <tr>
              {selecting && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="admin-check"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    aria-label="Select all delivered orders"
                  />
                </th>
              )}
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isOn = selected.has(o.id);
              return (
                <tr
                  key={o.id}
                  className={`border-b border-line last:border-0${selecting && isOn ? " delivered-row-selected" : ""}`}
                >
                  {selecting && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="admin-check"
                        checked={isOn}
                        onChange={() => toggleOne(o.id)}
                        aria-label={`Select ${o.orderNumber}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-magenta hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{o.createdAtLabel}</td>
                  <td className="px-4 py-3">{o.senderName}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">{formatNaira(o.totalKobo)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={confirmOpen}
        title={count === 1 ? "Delete this order?" : `Delete ${count} orders?`}
        message="This permanently removes the selected delivered order(s) from your records. This cannot be undone."
        confirmLabel={count === 1 ? "Delete order" : `Delete ${count} orders`}
        loading={loading}
        onCancel={() => !loading && setConfirmOpen(false)}
        onConfirm={deleteSelected}
      />
    </>
  );
}
