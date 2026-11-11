import { isValidPaystackSignature, verifyPaystack } from "@/lib/paystack";
import { confirmPaystackPayment } from "@/lib/payment-confirm";

/**
 * Paystack webhook (set this URL in Paystack → Settings → API Keys & Webhooks):
 *   https://<your-domain>/api/paystack/webhook
 * Catches payments where the customer closed the tab before returning to the site.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!isValidPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    // Acknowledge events we don't handle so Paystack stops retrying them.
    return new Response("Ignored", { status: 200 });
  }

  try {
    // Re-check with the Verify API instead of trusting the webhook body alone.
    const verified = await verifyPaystack(event.data.reference);
    const result = await confirmPaystackPayment(verified);
    if (!result.ok) {
      console.error(`Webhook: payment ${event.data.reference} not confirmed (${result.reason})`);
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Paystack webhook failed", err);
    // 500 makes Paystack retry later.
    return new Response("Error", { status: 500 });
  }
}
