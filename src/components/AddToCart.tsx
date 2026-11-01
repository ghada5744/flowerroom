"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

type Variant = {
  id: string;
  name: string;
  priceKobo: number;
  color: string | null;
};

type Props = {
  productId: string;
  slug: string;
  productName: string;
  imageUrl?: string | null;
  variants: Variant[];
  soldOut?: boolean;
};

export function AddToCart({ productId, slug, productName, imageUrl, variants, soldOut = false }: Props) {
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const router = useRouter();

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) || variants[0],
    [variants, variantId],
  );

  if (!selected) return null;

  function handleAdd(goCheckout = false) {
    if (soldOut) return;
    addItem(
      {
        productId,
        variantId: selected.id,
        slug,
        productName,
        variantName: selected.name,
        imageUrl,
        unitKobo: selected.priceKobo,
      },
      qty,
    );
    if (goCheckout) router.push("/checkout");
    else router.push("/cart");
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor="variant">
          Choose size / option
        </label>
        <select
          id="variant"
          className="input"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {formatNaira(v.priceKobo)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="qty">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-ghost px-3 py-2"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <input
            id="qty"
            className="input w-20 text-center"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
          <button type="button" className="btn-ghost px-3 py-2" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
      </div>

      <p className="font-display text-3xl text-magenta">{formatNaira(selected.priceKobo * qty)}</p>

      {soldOut ? (
        <p className="sold-out-message" role="status">
          This arrangement is sold out right now — you can&apos;t add it to your cart.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => handleAdd(false)}>
            Add to cart
          </button>
          <button type="button" className="btn-ghost" onClick={() => handleAdd(true)}>
            Buy now
          </button>
        </div>
      )}
    </div>
  );
}
