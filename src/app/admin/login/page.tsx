"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-6 max-w-md border border-line bg-white px-8 py-10 shadow-[0_18px_50px_rgba(26,26,26,0.06)]">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-magenta uppercase">Staff</p>
      <h1 className="mt-2 font-display text-4xl">Admin login</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Manage products, photos, orders and customers. This is separate from the customer sign-in.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" className="input" required />
        </div>
        {error && <p className="text-sm text-magenta">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
