"use client";

import { useRef, useState } from "react";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export function GalleryEditor({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "products");
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange([...value, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= value.length) return;
    const copy = [...value];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  }

  return (
    <div>
      <p className="label">Photos</p>
      <p className="mb-3 text-[12px] leading-relaxed text-muted">
        Upload one photo, or several of the same bouquet. The first image is the large photo and the shop cover.
        Extra photos appear as smaller thumbnails on the product page.
      </p>

      {value.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-3">
          {value.map((url, i) => (
            <li key={`${url}-${i}`} className="w-[108px]">
              <div className={`overflow-hidden border bg-cream ${i === 0 ? "h-28 border-magenta" : "h-20 border-line"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">{i === 0 ? "Main photo" : `Photo ${i + 1}`}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                {i > 0 && (
                  <button type="button" className="text-ink hover:text-magenta" onClick={() => move(i, -1)}>
                    Earlier
                  </button>
                )}
                {i < value.length - 1 && (
                  <button type="button" className="text-ink hover:text-magenta" onClick={() => move(i, 1)}>
                    Later
                  </button>
                )}
                <button type="button" className="text-magenta" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="block w-full max-w-xs text-sm"
        disabled={uploading}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {uploading && <p className="mt-2 text-xs text-muted">Uploading…</p>}
      {error && <p className="mt-2 text-sm text-magenta">{error}</p>}
    </div>
  );
}
