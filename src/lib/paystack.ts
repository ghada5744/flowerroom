const BASE = "https://api.paystack.co";

function secretKey() {
  return process.env.PAYSTACK_SECRET_KEY || "";
}

export async function initializePaystack(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      currency: "NGN",
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack initialize failed");
  }
  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function verifyPaystack(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack verify failed");
  }
  return data.data as {
    status: string;
    reference: string;
    amount: number;
    paid_at?: string;
    gateway_response?: string;
  };
}

export function isPaystackConfigured() {
  const key = secretKey();
  return Boolean(key && !key.includes("replace_me") && !key.includes("sk_test_xxx"));
}

/**
 * Fake “auto-paid” checkout (no Paystack). Only for local testing.
 * Requires ALLOW_DEMO_PAYMENTS=true and must never run in production.
 */
export function allowDemoPayments() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return false;
  }
  return process.env.ALLOW_DEMO_PAYMENTS === "true";
}
