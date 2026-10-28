import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one order."),
});

/** Bulk-delete delivered orders only. */
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = schema.parse(await req.json());
    const orders = await prisma.order.findMany({
      where: { id: { in: body.ids } },
      select: { id: true, status: true },
    });

    if (orders.length === 0) {
      return NextResponse.json({ error: "No matching orders found." }, { status: 404 });
    }

    const notDelivered = orders.filter((o) => o.status !== "DELIVERED");
    if (notDelivered.length > 0) {
      return NextResponse.json(
        { error: "Only delivered orders can be deleted. Deselect any open orders and try again." },
        { status: 400 },
      );
    }

    const result = await prisma.order.deleteMany({
      where: { id: { in: orders.map((o) => o.id) }, status: "DELIVERED" },
    });

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
