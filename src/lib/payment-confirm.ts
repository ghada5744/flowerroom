import { prisma } from "@/lib/prisma";
import { sendPaidOrderEmails } from "@/lib/order-email";
import type { PaystackTransaction } from "@/lib/paystack";

/** Orders still waiting for money. Anything further along must never be reset to PAID. */
const UNPAID_ORDER_STATUSES = ["PENDING", "AWAITING_PAYMENT", "CANCELLED"];

export type ConfirmResult =
  | { ok: true; orderNumber: string; firstConfirmation: boolean }
  | { ok: false; reason: "not_found" | "mismatch" | "not_success"; orderNumber?: string };

/**
 * Single place that turns a Paystack transaction into a paid order.
 * `tx` must come from the server-side Verify Transaction API (never from the browser).
 * Checks status, exact amount in kobo, NGN currency and reference, and is idempotent:
 * only the first caller (callback or webhook) flips the payment and sends emails.
 */
export async function confirmPaystackPayment(tx: PaystackTransaction): Promise<ConfirmResult> {
  const payment = await prisma.payment.findUnique({
    where: { reference: tx.reference },
    include: { order: true },
  });
  if (!payment) return { ok: false, reason: "not_found" };
  const orderNumber = payment.order.orderNumber;

  if (tx.status !== "success") {
    if (payment.status !== "paid") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed", paystackStatus: tx.status, raw: JSON.stringify(tx) },
      });
    }
    return { ok: false, reason: "not_success", orderNumber };
  }

  if (tx.amount !== payment.amountKobo || tx.currency !== "NGN") {
    console.error(
      `Paystack mismatch for ${tx.reference}: got ${tx.amount} ${tx.currency}, expected ${payment.amountKobo} NGN`,
    );
    if (payment.status !== "paid") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "mismatch", paystackStatus: tx.status, raw: JSON.stringify(tx) },
      });
    }
    return { ok: false, reason: "mismatch", orderNumber };
  }

  // Atomic claim: only one request can move this payment to "paid".
  const firstConfirmation = await prisma.$transaction(async (db) => {
    const claimed = await db.payment.updateMany({
      where: { id: payment.id, status: { not: "paid" } },
      data: {
        status: "paid",
        paystackStatus: tx.status,
        paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
        raw: JSON.stringify(tx),
      },
    });
    if (claimed.count === 0) return false;
    await db.order.updateMany({
      where: { id: payment.orderId, status: { in: UNPAID_ORDER_STATUSES } },
      data: { status: "PAID" },
    });
    return true;
  });

  if (firstConfirmation) {
    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true },
    });
    if (order) {
      try {
        await sendPaidOrderEmails(order);
      } catch (err) {
        console.error("Order email failed", err);
      }
    }
  }

  return { ok: true, orderNumber, firstConfirmation };
}
