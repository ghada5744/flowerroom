"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/format";

export type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalKobo: number;
  createdAtLabel: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryDate: string | null;
  giftMessage: string | null;
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    lineKobo: number;
  }[];
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

export function AccountOrdersPanel({ orders }: { orders: AccountOrder[] }) {
  const router = useRouter();
  const [detail, setDetail] = useState<AccountOrder | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AccountOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!detail && !pendingDelete) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || loading) return;
      if (pendingDelete) setPendingDelete(null);
      else setDetail(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, pendingDelete, loading]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/account/orders/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not remove order");
        setLoading(false);
        return;
      }
      setPendingDelete(null);
      setDetail(null);
      setLoading(false);
      router.refresh();
    } catch {
      alert("Could not remove order");
      setLoading(false);
    }
  }

  if (orders.length === 0) {
    return <p className="mt-4 text-sm text-muted">You haven&apos;t placed an order yet.</p>;
  }

  return (
    <>
      <ul className="mt-4 divide-y divide-line">
        {orders.map((order) => (
          <li key={order.id} className="account-order-row">
            <button
              type="button"
              className="account-order-main"
              onClick={() => setDetail(order)}
              aria-label={`View order ${order.orderNumber}`}
            >
              <div className="min-w-0 text-left">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="mt-0.5 text-muted">
                  {order.createdAtLabel} · {order.items.length} item
                  {order.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="font-medium text-magenta">{formatNaira(order.totalKobo)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </button>
            <div className="account-order-actions">
              <button
                type="button"
                className="account-order-icon-btn is-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(order);
                }}
                aria-label={`Remove ${order.orderNumber}`}
                title="Remove from my orders"
              >
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {detail && (
        <div className="account-order-overlay" role="presentation" onClick={() => setDetail(null)}>
          <div
            className="account-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-order-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-order-modal-head">
              <div>
                <p className="account-order-kicker">Order details</p>
                <h2 id="account-order-title" className="account-order-modal-title">
                  {detail.orderNumber}
                </h2>
              </div>
              <button
                type="button"
                className="account-order-close"
                onClick={() => setDetail(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="account-order-modal-meta">
              <OrderStatusBadge status={detail.status} />
              <span className="text-sm text-muted">{detail.createdAtLabel}</span>
            </div>

            <ul className="account-order-items">
              {detail.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.productName} · {item.variantName} × {item.quantity}
                  </span>
                  <span>{formatNaira(item.lineKobo)}</span>
                </li>
              ))}
            </ul>

            <p className="account-order-total">
              <span>Total</span>
              <strong>{formatNaira(detail.totalKobo)}</strong>
            </p>

            <div className="account-order-blocks">
              <div>
                <p className="account-order-block-label">From</p>
                <p>
                  {detail.senderName}
                  <br />
                  {detail.senderPhone}
                </p>
              </div>
              <div>
                <p className="account-order-block-label">Deliver to</p>
                <p>
                  {detail.recipientName}
                  <br />
                  {detail.recipientPhone}
                  <br />
                  {detail.deliveryAddress}
                  <br />
                  {detail.deliveryCity}
                  {detail.deliveryDate ? (
                    <>
                      <br />
                      {detail.deliveryDate}
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            {detail.giftMessage && (
              <div className="account-order-gift">
                <p className="account-order-block-label">Gift message</p>
                <p>“{detail.giftMessage}”</p>
              </div>
            )}

            <button type="button" className="btn-primary account-order-done" onClick={() => setDetail(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete ? `Remove ${pendingDelete.orderNumber}?` : "Remove order?"}
        message="This removes the order from your account list. You can still contact Flower Room if you need help with it."
        confirmLabel="Remove order"
        loading={loading}
        onCancel={() => !loading && setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
