"use client";

import { FormEvent, useState } from "react";

/** Inline subscribe — email/SIGN UP starts at header "Gift Sets". */
export function SubscribeStrip() {
  const [msg, setMsg] = useState("");
  const [invalid, setInvalid] = useState(false);

  async function onSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setInvalid(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    if (res.ok) {
      setMsg("Thanks for subscribing!");
      (e.target as HTMLFormElement).reset();
    } else {
      setInvalid(true);
      setMsg("Please enter a valid email address.");
    }
  }

  const fields = (
    <>
      <input
        name="email"
        type="email"
        required
        placeholder="Email*"
        aria-label="Email"
        className={invalid ? "input-error" : undefined}
        onChange={() => {
          setInvalid(false);
          setMsg("");
        }}
      />
      <button type="submit">SIGN UP</button>
    </>
  );

  return (
    <div className="subscribe-strip">
      <div className="subscribe-strip-copy">
        <h3>Subscribe</h3>
        <p>Sign up to get the latest on sales, new releases and more.</p>
      </div>

      <form onSubmit={onSubscribe} className="subscribe-strip-form subscribe-strip-form--mobile">
        {fields}
      </form>

      {/*
        Desktop: same centered nav row as the header (font + gap).
        Invisible labels keep spacing; form starts at "Gift Sets".
      */}
      <div className="subscribe-strip-align">
        <div className="subscribe-nav-mirror">
          <span className="subscribe-nav-ghost" aria-hidden="true">
            Our Complete Range
          </span>
          <span className="subscribe-nav-ghost" aria-hidden="true">
            Hand Tied Bouquets
          </span>
          <span className="subscribe-nav-ghost subscribe-nav-ghost--anchor">
            <span className="subscribe-nav-ghost-label" aria-hidden="true">
              Gift Sets
            </span>
            <form onSubmit={onSubscribe} className="subscribe-strip-form subscribe-strip-form--desktop">
              {fields}
            </form>
          </span>
          <span className="subscribe-nav-ghost" aria-hidden="true">
            Roses
          </span>
          <span className="subscribe-nav-ghost" aria-hidden="true">
            Signature Arrangements
          </span>
        </div>
      </div>

      {msg && <p className="subscribe-strip-msg">{msg}</p>}
    </div>
  );
}
