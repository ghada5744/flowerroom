import { notFound, redirect } from "next/navigation";
import { MarkDeliveredButton } from "@/components/admin/MarkDeliveredButton";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { OPEN_FULFILLMENT_STATUSES } from "@/lib/admin-orders";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted">{order.createdAt.toLocaleString()}</p>

        <div className="mt-6 border border-line bg-white p-5">
          <h2 className="text-xs tracking-[0.14em] uppercase text-magenta">Items</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.productName} · {item.variantName} × {item.quantity}
                </span>
                <span>{formatNaira(item.lineKobo)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-line pt-3 font-medium">
            <span>Total</span>
            <span className="text-magenta">{formatNaira(order.totalKobo)}</span>
          </p>
        </div>

        <div className="mt-6 grid gap-4 border border-line bg-white p-5 text-sm sm:grid-cols-2">
          <div>
            <h2 className="text-xs tracking-[0.14em] uppercase text-magenta">Sender</h2>
            <p className="mt-2">{order.senderName}</p>
            <p>{order.senderEmail}</p>
            <p>{order.senderPhone}</p>
          </div>
          <div>
            <h2 className="text-xs tracking-[0.14em] uppercase text-magenta">Recipient</h2>
            <p className="mt-2">{order.recipientName}</p>
            <p>{order.recipientPhone}</p>
            <p className="mt-2">{order.deliveryAddress}</p>
            <p>
              {order.deliveryCity}
              {order.deliveryDate ? ` · ${order.deliveryDate}` : ""}
            </p>
            {order.giftMessage && <p className="mt-2 italic text-muted">&ldquo;{order.giftMessage}&rdquo;</p>}
          </div>
        </div>
      </div>

      <aside className="h-fit border border-line bg-white p-5">
        <h2 className="font-display text-2xl">Fulfillment</h2>
        <p className="mt-2 text-sm text-muted">
          Payment: {order.payment?.status || "—"}
          {order.payment?.reference ? ` (${order.payment.reference})` : ""}
        </p>
        {(OPEN_FULFILLMENT_STATUSES as readonly string[]).includes(order.status) && (
          <div className="mt-4">
            <MarkDeliveredButton orderId={order.id} />
          </div>
        )}
        <div className="mt-4">
          <OrderStatusForm orderId={order.id} status={order.status} notes={order.notes || ""} />
        </div>
      </aside>
    </div>
  );
}
