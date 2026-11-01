"use client";

import { useRef, useState } from "react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
};

export function ImageUpload({ value, onChange, folder = "products", label = "Photo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setWarning("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden border border-line bg-cream">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[11px] text-muted">No photo yet</span>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="admin-upload-trigger"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : value ? "Change photo" : "+ Add photo"}
          </button>
          <p className="text-[12px] text-muted">Upload from your phone or computer (JPG/PNG, max 5MB).</p>
          {value && (
            <button
              type="button"
              className="text-xs font-medium text-magenta underline underline-offset-2"
              onClick={() => onChange(null)}
            >
              Remove photo
            </button>
          )}
          {warning && <p className="text-xs text-muted">{warning}</p>}
          {error && <p className="text-sm text-magenta">{error}</p>}
        </div>
      </div>
    </div>
  );
}
