import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaidOrderEmails } from "@/lib/order-email";
import { allowDemoPayments, isPaystackConfigured, verifyPaystack } from "@/lib/paystack";
import { confirmPaystackPayment } from "@/lib/payment-confirm";

/**
 * Paystack callback_url. The browser lands here after paying, but the order is only
 * marked paid after this server calls Paystack's Verify Transaction API with the secret key.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/order/failed`);
  }
  const ref = encodeURIComponent(reference);

  try {
    if (!isPaystackConfigured()) {
      if (!allowDemoPayments()) {
        return NextResponse.redirect(`${siteUrl}/order/failed?reason=payments_not_configured`);
      }
      // Local testing only: mark paid without calling Paystack
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { order: true },
      });
      if (!payment) {
        return NextResponse.redirect(`${siteUrl}/order/failed?reason=not_found`);
      }
      const alreadyPaid = payment.status === "demo_paid" || payment.status === "paid";
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "demo_paid", paystackStatus: "success", paidAt: new Date() },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        }),
      ]);
      if (!alreadyPaid) {
        const order = await prisma.order.findUnique({
          where: { id: payment.orderId },
          include: { items: true },
        });
        if (order) await sendPaidOrderEmails(order).catch((e) => console.error("Order email failed", e));
      }
      return NextResponse.redirect(
        `${siteUrl}/order/success?reference=${ref}&order=${payment.order.orderNumber}`,
      );
    }

    const verified = await verifyPaystack(reference);
    const result = await confirmPaystackPayment(verified);

    if (result.ok) {
      return NextResponse.redirect(
        `${siteUrl}/order/success?reference=${ref}&order=${result.orderNumber}`,
      );
    }
    return NextResponse.redirect(`${siteUrl}/order/failed?reference=${ref}&reason=${result.reason}`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${siteUrl}/order/failed?reference=${ref}`);
  }
}
