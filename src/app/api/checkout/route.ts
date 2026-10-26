import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/format";
import { allowDemoPayments, initializePaystack, isPaystackConfigured } from "@/lib/paystack";
import { getCustomerSession } from "@/lib/customer-auth";

const schema = z.object({
  senderName: z.string().min(2),
  senderEmail: z.string().email(),
  senderPhone: z.string().min(7),
  recipientName: z.string().min(2),
  recipientPhone: z.string().min(7),
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().default("Lagos"),
  deliveryDate: z.string().optional().nullable(),
  giftMessage: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: body.items.map((i) => i.variantId) }, active: true },
      include: { product: true },
    });

    if (variants.length !== body.items.length) {
      return NextResponse.json({ error: "One or more items are unavailable." }, { status: 400 });
    }

    const byId = Object.fromEntries(variants.map((v) => [v.id, v]));
    let subtotal = 0;
    const lineItems = body.items.map((item) => {
      const v = byId[item.variantId];
      if (!v || v.productId !== item.productId || !v.product.active) {
        throw new Error("Invalid cart item");
      }
      const line = v.priceKobo * item.quantity;
      subtotal += line;
      return {
        productId: v.productId,
        variantId: v.id,
        productName: v.product.name,
        variantName: v.name,
        quantity: item.quantity,
        unitKobo: v.priceKobo,
        lineKobo: line,
      };
    });

    const orderNumber = generateOrderNumber();
    const reference = `fr_${orderNumber.replace(/-/g, "").toLowerCase()}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await getCustomerSession();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        userId: session?.userId || null,
        senderName: body.senderName,
        senderEmail: body.senderEmail,
        senderPhone: body.senderPhone,
        recipientName: body.recipientName,
        recipientPhone: body.recipientPhone,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity || "Lagos",
        deliveryDate: body.deliveryDate || null,
        giftMessage: body.giftMessage || null,
        subtotalKobo: subtotal,
        totalKobo: subtotal,
        items: { create: lineItems },
        payment: {
          create: {
            reference,
            amountKobo: subtotal,
            status: "initialized",
          },
        },
      },
    });

    if (!isPaystackConfigured()) {
      if (!allowDemoPayments()) {
        return NextResponse.json(
          { error: "Payments are not configured. Set PAYSTACK_SECRET_KEY (live or test)." },
          { status: 503 },
        );
      }
      // Local testing only: skip Paystack and send to success with mock
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "AWAITING_PAYMENT", notes: "Paystack not configured — demo checkout." },
      });
      return NextResponse.json({
        authorizationUrl: `${siteUrl}/order/success?reference=${reference}&demo=1`,
        reference,
        demo: true,
      });
    }

    const init = await initializePaystack({
      email: body.senderEmail,
      amountKobo: subtotal,
      reference,
      callbackUrl: `${siteUrl}/api/paystack/verify?reference=${reference}`,
      metadata: { orderId: order.id, orderNumber },
    });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { accessCode: init.access_code },
    });

    return NextResponse.json({
      authorizationUrl: init.authorization_url,
      reference: init.reference,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
