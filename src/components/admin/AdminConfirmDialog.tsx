"use client";

import { useEffect } from "react";

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="admin-confirm-overlay" role="presentation" onClick={() => !loading && onCancel()}>
      <div
        className="admin-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="admin-confirm-kicker">Please confirm</p>
        <h2 id="admin-confirm-title" className="admin-confirm-title">
          {title}
        </h2>
        <p id="admin-confirm-desc" className="admin-confirm-message">
          {message}
        </p>
        <div className="admin-confirm-actions">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="admin-confirm-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
