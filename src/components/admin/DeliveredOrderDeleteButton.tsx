"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

export function DeliveredOrderDeleteButton({
  id,
  orderNumber,
}: {
  id: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not delete order");
        setLoading(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      alert("Could not delete order");
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="mark-delivered-btn" onClick={() => setOpen(true)}>
        Delete
      </button>
      <AdminConfirmDialog
        open={open}
        title={`Delete ${orderNumber}?`}
        message="This permanently removes this delivered order from your records. This cannot be undone."
        confirmLabel="Delete order"
        loading={loading}
        onCancel={() => !loading && setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}
