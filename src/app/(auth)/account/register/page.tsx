"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [marketing, setMarketing] = useState(true);

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          password: form.get("password"),
          marketingOptIn: marketing,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields && typeof data.fields === "object") setFieldErrors(data.fields);
        throw new Error(data.error || "Registration failed");
      }
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-center text-[1.75rem] font-semibold tracking-tight text-ink">Create account</h1>
      <p className="mt-2 text-center text-[15px] text-[#6b6b6b]">Join Flower Room for faster checkout</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Full name"
            className={`auth-input${fieldErrors.name ? " input-error" : ""}`}
            onChange={() => clearField("name")}
          />
          {fieldErrors.name && <p className="field-error text-left">{fieldErrors.name}</p>}
        </div>
        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            className={`auth-input${fieldErrors.email ? " input-error" : ""}`}
            onChange={() => clearField("email")}
          />
          {fieldErrors.email && <p className="field-error text-left">{fieldErrors.email}</p>}
        </div>
        <div>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            minLength={7}
            autoComplete="tel"
            placeholder="Phone number"
            className={`auth-input${fieldErrors.phone ? " input-error" : ""}`}
            onChange={() => clearField("phone")}
          />
          {fieldErrors.phone && <p className="field-error text-left">{fieldErrors.phone}</p>}
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Password (min. 6 characters)"
            className={`auth-input${fieldErrors.password ? " input-error" : ""}`}
            onChange={() => clearField("password")}
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Create account"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-ink disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          {fieldErrors.password && <p className="field-error text-left">{fieldErrors.password}</p>}
        </div>

        <label className="flex items-start gap-3 text-[13px] leading-snug text-ink">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
          />
          <span>Sign up for exclusive offers, news and our VIP program</span>
        </label>

        {error && <p className="text-center text-sm text-magenta">{error}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-[12px] leading-relaxed text-[#6b6b6b]">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of service
        </Link>
      </p>

      <p className="mt-8 text-center text-[14px] text-ink">
        Already have an account?{" "}
        <Link href="/account/login" className="font-medium underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
