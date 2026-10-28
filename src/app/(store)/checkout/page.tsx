"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import type { FieldErrors } from "@/lib/form-errors";

type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

function fieldClass(errors: FieldErrors, name: string) {
  return errors[name] ? "input input-error" : "input";
}

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotalKobo = useCart((s) => s.subtotalKobo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

  function clearField(name: string) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
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
      if (!res.ok) {
        if (data.fields && typeof data.fields === "object") {
          setFieldErrors(data.fields);
        }
        throw new Error(data.error || "Checkout failed. Please check the form.");
      }
      // Keep cart until payment succeeds (cleared on the success page)
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
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
                className={fieldClass(fieldErrors, "senderName")}
                required
                defaultValue={user?.name || ""}
                onChange={() => clearField("senderName")}
              />
              {fieldErrors.senderName && <p className="field-error">{fieldErrors.senderName}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="senderEmail">Email</label>
                <input
                  id="senderEmail"
                  name="senderEmail"
                  type="email"
                  className={fieldClass(fieldErrors, "senderEmail")}
                  required
                  defaultValue={user?.email || ""}
                  onChange={() => clearField("senderEmail")}
                />
                {fieldErrors.senderEmail && <p className="field-error">{fieldErrors.senderEmail}</p>}
              </div>
              <div>
                <label className="label" htmlFor="senderPhone">Phone</label>
                <input
                  id="senderPhone"
                  name="senderPhone"
                  className={fieldClass(fieldErrors, "senderPhone")}
                  required
                  defaultValue={user?.phone || ""}
                  onChange={() => clearField("senderPhone")}
                />
                {fieldErrors.senderPhone && <p className="field-error">{fieldErrors.senderPhone}</p>}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs tracking-[0.14em] uppercase text-magenta">Recipient & delivery</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="recipientName">Recipient name</label>
                <input
                  id="recipientName"
                  name="recipientName"
                  className={fieldClass(fieldErrors, "recipientName")}
                  required
                  onChange={() => clearField("recipientName")}
                />
                {fieldErrors.recipientName && <p className="field-error">{fieldErrors.recipientName}</p>}
              </div>
              <div>
                <label className="label" htmlFor="recipientPhone">Recipient phone</label>
                <input
                  id="recipientPhone"
                  name="recipientPhone"
                  className={fieldClass(fieldErrors, "recipientPhone")}
                  required
                  onChange={() => clearField("recipientPhone")}
                />
                {fieldErrors.recipientPhone && <p className="field-error">{fieldErrors.recipientPhone}</p>}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="deliveryAddress">Delivery address (Lagos)</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                className={`${fieldClass(fieldErrors, "deliveryAddress")} min-h-24`}
                required
                onChange={() => clearField("deliveryAddress")}
              />
              {fieldErrors.deliveryAddress && <p className="field-error">{fieldErrors.deliveryAddress}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="deliveryCity">City</label>
                <input
                  id="deliveryCity"
                  name="deliveryCity"
                  className={fieldClass(fieldErrors, "deliveryCity")}
                  defaultValue="Lagos"
                  onChange={() => clearField("deliveryCity")}
                />
                {fieldErrors.deliveryCity && <p className="field-error">{fieldErrors.deliveryCity}</p>}
              </div>
              <div>
                <label className="label" htmlFor="deliveryDate">Preferred delivery date</label>
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  className={fieldClass(fieldErrors, "deliveryDate")}
                  onChange={() => clearField("deliveryDate")}
                />
                {fieldErrors.deliveryDate && <p className="field-error">{fieldErrors.deliveryDate}</p>}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="giftMessage">Gift message</label>
              <textarea
                id="giftMessage"
                name="giftMessage"
                className={`${fieldClass(fieldErrors, "giftMessage")} min-h-20`}
                onChange={() => clearField("giftMessage")}
              />
              {fieldErrors.giftMessage && <p className="field-error">{fieldErrors.giftMessage}</p>}
            </div>
          </fieldset>

          {error && !Object.keys(fieldErrors).length && <p className="field-error">{error}</p>}
          {error && Object.keys(fieldErrors).length > 0 && (
            <p className="field-error">Please fix the highlighted fields and try again.</p>
          )}

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
