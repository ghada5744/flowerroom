"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [marketing, setMarketing] = useState(true);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields && typeof data.fields === "object") setFieldErrors(data.fields);
        throw new Error(data.error || "Login failed");
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-center text-[1.75rem] font-semibold tracking-tight text-ink">Sign in</h1>
      <p className="mt-2 text-center text-[15px] text-[#6b6b6b]">Sign in or create an account</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            className={`auth-input${fieldErrors.email ? " input-error" : ""}`}
            onChange={() => setFieldErrors((p) => ({ ...p, email: "" }))}
          />
          {fieldErrors.email && <p className="field-error text-left">{fieldErrors.email}</p>}
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className={`auth-input${fieldErrors.password ? " input-error" : ""}`}
            onChange={() => setFieldErrors((p) => ({ ...p, password: "" }))}
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Sign in"
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-[12px] leading-relaxed text-[#6b6b6b]">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of service
        </Link>
      </p>

      <div className="mt-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e5e5e5]" />
        <span className="text-[12px] text-[#6b6b6b]">or</span>
        <span className="h-px flex-1 bg-[#e5e5e5]" />
      </div>

      <p className="mt-6 text-center text-[14px] text-ink">
        Don&apos;t have an account?{" "}
        <Link href="/account/register" className="font-medium underline underline-offset-2">
          Register now
        </Link>
      </p>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[380px] py-10 text-center text-sm text-[#6b6b6b]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
