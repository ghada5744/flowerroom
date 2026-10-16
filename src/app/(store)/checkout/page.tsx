"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotalKobo = useCart((s) => s.subtotalKobo);
  const clear = useCart((s) => s.clear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<CustomerUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl">Nothing to checkout</h1>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Shop now
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: form.get("senderName"),
          senderEmail: form.get("senderEmail"),
          senderPhone: form.get("senderPhone"),
          recipientName: form.get("recipientName"),
          recipientPhone: form.get("recipientPhone"),
          deliveryAddress: form.get("deliveryAddress"),
          deliveryCity: form.get("deliveryCity") || "Lagos",
          deliveryDate: form.get("deliveryDate"),
          giftMessage: form.get("giftMessage"),
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clear();
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-magenta uppercase">Secure checkout</p>
        <h1 className="mt-2 font-display text-5xl">Checkout</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Pay with Paystack (cards and bank transfer in Naira). We confirm the order and send a video of the arrangement before delivery.
        </p>
        {!user && (
          <p className="mt-4 text-sm text-muted">
            Have an account?{" "}
            <Link href="/account/login?next=/checkout" className="text-magenta underline underline-offset-2">
              Sign in
            </Link>{" "}
            for faster checkout, or{" "}
            <Link href="/account/register" className="text-magenta underline underline-offset-2">
              create one
            </Link>
            .
          </p>
        )}
        {user && (
          <p className="mt-4 text-sm text-muted">
            Signed in as <span className="font-medium text-ink">{user.email}</span> — your details are prefilled.
          </p>
        )}
        <form onSubmit={onSubmit} className="mt-8 space-y-8 border border-[#eadfce] bg-white p-6 md:p-8" key={user?.id || "guest"}>
          <fieldset className="space-y-4">
            <legend className="text-xs tracking-[0.14em] uppercase text-magenta">Sender</legend>
            <div>
              <label className="label" htmlFor="senderName">Full name</label>
              <input
                id="senderName"
                name="senderName"
                className="input"
                required
                defaultValue={user?.name || ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="senderEmail">Email</label>
                <input
                  id="senderEmail"
                  name="senderEmail"
                  type="email"
                  className="input"
                  required
                  defaultValue={user?.email || ""}
                />
              </div>
              <div>
                <label className="label" htmlFor="senderPhone">Phone</label>
                <input
                  id="senderPhone"
                  name="senderPhone"
                  className="input"
                  required
                  defaultValue={user?.phone || ""}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs tracking-[0.14em] uppercase text-magenta">Recipient & delivery</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="recipientName">Recipient name</label>
                <input id="recipientName" name="recipientName" className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="recipientPhone">Recipient phone</label>
                <input id="recipientPhone" name="recipientPhone" className="input" required />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="deliveryAddress">Delivery address (Lagos)</label>
              <textarea id="deliveryAddress" name="deliveryAddress" className="input min-h-24" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="deliveryCity">City</label>
                <input id="deliveryCity" name="deliveryCity" className="input" defaultValue="Lagos" />
              </div>
              <div>
                <label className="label" htmlFor="deliveryDate">Preferred delivery date</label>
                <input id="deliveryDate" name="deliveryDate" type="date" className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="giftMessage">Gift message</label>
              <textarea id="giftMessage" name="giftMessage" className="input min-h-20" />
            </div>
          </fieldset>

          {error && <p className="text-sm text-magenta">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Redirecting to Paystack…" : `Pay ${formatNaira(subtotalKobo())} with Paystack`}
          </button>
          <p className="text-[12px] leading-relaxed text-muted">
            Card details stay on Paystack. Flower Room never stores your card number.
          </p>
        </form>
      </div>

      <aside className="h-fit border border-[#eadfce] bg-white p-6 md:sticky md:top-28">
        <h2 className="font-display text-3xl">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-3">
              <span>
                {i.productName} · {i.variantName} × {i.quantity}
              </span>
              <span>{formatNaira(i.unitKobo * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex justify-between border-t border-line pt-4 font-medium">
          <span>Total</span>
          <span className="text-magenta">{formatNaira(subtotalKobo())}</span>
        </p>
      </aside>
    </div>
  );
}
