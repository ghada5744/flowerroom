import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/** Soft-remove an order from the customer’s My Account list. */
export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const email = session.email.trim().toLowerCase();

  try {
    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [{ userId: session.userId }, { senderEmail: email }],
      },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { customerHidden: true },
    });

    revalidatePath("/account");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Could not remove order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
