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
    <div className="cart-page mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl">Cart</h1>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.variantId} className="cart-line">
            <div className="cart-line-main">
              <div className="cart-line-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl || "/images/lilac.jpg"} alt="" />
              </div>
              <div className="cart-line-info">
                <div className="cart-line-top">
                  <div>
                    <Link href={`/product/${item.slug}`} className="cart-line-name">
                      {item.productName}
                    </Link>
                    <p className="cart-line-variant">{item.variantName}</p>
                    <p className="cart-line-unit">{formatNaira(item.unitKobo)}</p>
                  </div>
                  <button
                    type="button"
                    className="cart-trash-btn cart-trash-mobile"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Remove ${item.productName} from cart`}
                    title="Remove from cart"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
                      <path d="M4 7h16" />
                      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                      <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>

                <div className="cart-line-actions">
                  <div className="cart-qty">
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-line-amount">{formatNaira(item.unitKobo * item.quantity)}</p>
                  <button
                    type="button"
                    className="cart-trash-btn cart-trash-desktop"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Remove ${item.productName} from cart`}
                    title="Remove from cart"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
                      <path d="M4 7h16" />
                      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                      <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
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
