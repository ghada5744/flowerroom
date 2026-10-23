"use client";

import { FormEvent, useState } from "react";

/** Subscribe heading, then one row: tagline + email/SIGN UP. */
export function SubscribeStrip() {
  const [msg, setMsg] = useState("");

  async function onSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setMsg(res.ok ? "Thanks for subscribing!" : "Could not subscribe.");
    if (res.ok) (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="subscribe-strip">
      <h3 className="subscribe-strip-title">Subscribe</h3>

      <div className="subscribe-strip-row">
        <p className="subscribe-strip-tagline">
          Sign up to get the latest on sales, new releases and more.
        </p>
        <form onSubmit={onSubscribe} className="subscribe-strip-form">
          <input name="email" type="email" required placeholder="Email*" aria-label="Email" />
          <button type="submit">SIGN UP</button>
        </form>
      </div>

      {msg && <p className="subscribe-strip-msg">{msg}</p>}
    </div>
  );
}
