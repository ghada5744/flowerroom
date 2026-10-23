"use client";

import { FormEvent, useState } from "react";

/** Inline subscribe — copy left, email/SIGN UP on the same row (desktop). */
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
      <div className="subscribe-strip-copy">
        <h3>Subscribe</h3>
        <p>Sign up to get the latest on sales, new releases and more.</p>
      </div>

      <form onSubmit={onSubscribe} className="subscribe-strip-form">
        <input name="email" type="email" required placeholder="Email*" aria-label="Email" />
        <button type="submit">SIGN UP</button>
      </form>

      {msg && <p className="subscribe-strip-msg">{msg}</p>}
    </div>
  );
}
