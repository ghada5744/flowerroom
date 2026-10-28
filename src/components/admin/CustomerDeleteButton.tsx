"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

export function CustomerDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not delete customer");
        setLoading(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      alert("Could not delete customer");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="customer-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Delete ${name}`}
        title="Delete account"
      >
        Delete
      </button>
      <AdminConfirmDialog
        open={open}
        title={`Delete ${name}?`}
        message="This removes their login account. Past orders stay in your records, but they will no longer be linked to this customer."
        confirmLabel="Delete account"
        loading={loading}
        onCancel={() => !loading && setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}
