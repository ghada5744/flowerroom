"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryEditor } from "@/components/admin/GalleryEditor";

type Category = { id: string; name: string };
type VariantInput = { id?: string; name: string; priceNaira: string };

type Props = {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    badge: string | null;
    active: boolean;
    featured: boolean;
    categoryId: string;
    images?: { url: string }[];
    variants: { id: string; name: string; priceKobo: number; color: string | null }[];
  };
};

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    product?.images?.map((img) => img.url).filter(Boolean) ||
      (product?.imageUrl ? [product.imageUrl] : []),
  );
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.map((v) => ({
      id: v.id,
      name: v.name,
      priceNaira: String(v.priceKobo / 100),
    })) || [{ name: "Standard", priceNaira: "0" }],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      images,
      imageUrl: images[0] || null,
      badge: form.get("badge") || null,
      categoryId: form.get("categoryId"),
      active: form.get("active") === "on",
      featured: form.get("featured") === "on",
      variants: variants.map((v, i) => ({
        id: v.id,
        name: v.name || "Standard",
        priceKobo: Math.round(Number(v.priceNaira) * 100) || 0,
        color: null,
        sortOrder: i,
      })),
    };

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = product ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      setLoading(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted">
        Create a shop section first under{" "}
        <a href="/admin/categories" className="text-magenta underline">
          Sections
        </a>
        , then add products.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="label" htmlFor="name">
          Product name
        </label>
        <input id="name" name="name" className="input" defaultValue={product?.name} required placeholder="e.g. Pink Delight Hatbox" />
      </div>

      <div>
        <label className="label" htmlFor="categoryId">
          Section
        </label>
        <select id="categoryId" name="categoryId" className="input" defaultValue={product?.categoryId} required>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[12px] text-muted">
          Choose where it appears in the shop. Manage sections in{" "}
          <a href="/admin/categories" className="text-magenta underline">
            Sections
          </a>
          .
        </p>
      </div>

      <GalleryEditor value={images} onChange={setImages} />

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="input min-h-28"
          defaultValue={product?.description}
          required
          placeholder="Short description customers will see"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs tracking-[0.14em] uppercase text-magenta">Price (₦)</p>
          <button
            type="button"
            className="text-sm text-magenta"
            onClick={() => setVariants((v) => [...v, { name: "", priceNaira: "0" }])}
          >
            + Add size / option
          </button>
        </div>
        <p className="mb-3 text-[12px] text-muted">
          Use 0 for “enquire on WhatsApp”. Add more rows only if you sell sizes (Small / Large).
        </p>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1.2fr_1fr_auto]">
              <input
                className="input"
                placeholder="Size name (e.g. Standard)"
                value={v.name}
                onChange={(e) =>
                  setVariants((list) =>
                    list.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)),
                  )
                }
                required
              />
              <input
                className="input"
                placeholder="Price in Naira"
                type="number"
                min={0}
                value={v.priceNaira}
                onChange={(e) =>
                  setVariants((list) =>
                    list.map((row, idx) => (idx === i ? { ...row, priceNaira: e.target.value } : row)),
                  )
                }
                required
              />
              {variants.length > 1 ? (
                <button
                  type="button"
                  className="btn-ghost px-3"
                  onClick={() => setVariants((list) => list.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="badge">
          Badge (optional)
        </label>
        <input id="badge" name="badge" className="input" defaultValue={product?.badge || ""} placeholder="e.g. Best seller" />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Show in shop
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured on home
        </label>
      </div>

      {error && <p className="text-sm text-magenta">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving…" : product ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
