import Link from "next/link";
import { redirect } from "next/navigation";
import { DeliveredOrderDeleteButton } from "@/components/admin/DeliveredOrderDeleteButton";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrdersTabs } from "@/components/admin/OrdersTabs";
import { deliveredWhere } from "@/lib/admin-orders";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDeliveredOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    where: deliveredWhere,
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Delivered orders</h1>
          <p className="mt-2 text-sm text-muted">Completed deliveries — delete only when you no longer need the record.</p>
        </div>
        <OrdersTabs active="delivered" />
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-magenta hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{o.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3">{o.senderName}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">{formatNaira(o.totalKobo)}</td>
                <td className="px-4 py-3 text-right">
                  <DeliveredOrderDeleteButton id={o.id} orderNumber={o.orderNumber} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No delivered orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
