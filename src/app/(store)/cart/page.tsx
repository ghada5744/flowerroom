"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotalKobo = useCart((s) => s.subtotalKobo);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">Browse our collections and add something beautiful.</p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl">Cart</h1>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.variantId} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden bg-blush">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl || "/images/lilac.jpg"}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="font-medium hover:text-magenta">
                {item.productName}
              </Link>
              <p className="text-sm text-muted">{item.variantName}</p>
              <p className="mt-1 text-sm">{formatNaira(item.unitKobo)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost px-3 py-1"
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                className="btn-ghost px-3 py-1"
                onClick={() => setQuantity(item.variantId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="text-right sm:w-28">
              <p className="font-medium">{formatNaira(item.unitKobo * item.quantity)}</p>
              <button
                type="button"
                className="mt-1 text-xs text-muted hover:text-magenta"
                onClick={() => removeItem(item.variantId)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <p className="text-[15px] tracking-wide">
          Subtotal: <strong className="text-magenta">{formatNaira(subtotalKobo())}</strong>
        </p>
        <Link href="/checkout" className="btn-primary cart-checkout">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
