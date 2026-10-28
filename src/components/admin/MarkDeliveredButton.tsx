"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkDeliveredButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markDelivered() {
    if (!confirm("Mark this order as delivered?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not update order");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="mark-delivered-btn"
      onClick={markDelivered}
      disabled={loading}
    >
      {loading ? "…" : "Delivered"}
    </button>
  );
}
