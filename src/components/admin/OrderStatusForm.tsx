"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "PAID",
  "ARRANGING",
  "VIDEO_APPROVED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export function OrderStatusForm({
  orderId,
  status,
  notes,
}: {
  orderId: string;
  status: string;
  notes: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        notes: form.get("notes"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Update failed");
      return;
    }
    setMessage("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" className="input" defaultValue={status}>
          {(STATUSES.includes(status) ? STATUSES : [status, ...STATUSES]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="notes">
          Internal notes
        </label>
        <textarea id="notes" name="notes" className="input min-h-24" defaultValue={notes} />
      </div>
      {message && <p className="text-sm text-magenta">{message}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Update order"}
      </button>
    </form>
  );
}
