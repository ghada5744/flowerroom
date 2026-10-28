import { prisma } from "@/lib/prisma";

const OPEN_CHECKOUT = ["PENDING", "AWAITING_PAYMENT"] as const;

/** Cancelled checkouts stay out of “My orders”. Unpaid ones stay visible with status. */
export const HIDDEN_FROM_ACCOUNT = ["CANCELLED"] as const;

/**
 * Cancel leftover unpaid checkouts for this customer before starting a new one.
 * Keeps “My orders” clean: only one payment attempt in flight.
 */
export async function cancelAbandonedCheckouts(opts: {
  userId?: string | null;
  email: string;
  exceptOrderId?: string;
}) {
  const email = opts.email.trim().toLowerCase();
  const or: { userId?: string; senderEmail?: string }[] = [{ senderEmail: email }];
  if (opts.userId) or.push({ userId: opts.userId });

  await prisma.order.updateMany({
    where: {
      status: { in: [...OPEN_CHECKOUT] },
      OR: or,
      ...(opts.exceptOrderId ? { id: { not: opts.exceptOrderId } } : {}),
    },
    data: {
      status: "CANCELLED",
      notes: "Replaced by a newer checkout — payment was not completed.",
    },
  });
}

/** Friendly label for customers (never show raw PENDING dumps). */
export function orderStatusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PROCESSING":
    case "ARRANGING":
      return "Preparing";
    case "VIDEO_APPROVED":
      return "Video approved";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "AWAITING_PAYMENT":
    case "PENDING":
      return "Not paid yet";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status.replaceAll("_", " ").toLowerCase();
  }
}

/** Soft badge tone for admin tables. */
export function orderStatusTone(status: string): "paid" | "progress" | "delivery" | "done" | "cancel" | "wait" {
  switch (status) {
    case "PAID":
      return "paid";
    case "ARRANGING":
    case "PROCESSING":
    case "VIDEO_APPROVED":
      return "progress";
    case "OUT_FOR_DELIVERY":
      return "delivery";
    case "DELIVERED":
      return "done";
    case "CANCELLED":
      return "cancel";
    default:
      return "wait";
  }
}
