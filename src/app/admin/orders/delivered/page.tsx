import { redirect } from "next/navigation";
import { DeliveredOrdersTable } from "@/components/admin/DeliveredOrdersTable";
import { OrdersTabs } from "@/components/admin/OrdersTabs";
import { deliveredWhere } from "@/lib/admin-orders";
import { isAdminAuthenticated } from "@/lib/auth";
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
          <p className="mt-2 text-sm text-muted">
            Completed deliveries. Use the trash when you want to clear records.
          </p>
        </div>
        <OrdersTabs active="delivered" />
      </div>

      <DeliveredOrdersTable
        orders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAtLabel: o.createdAt.toLocaleString(),
          senderName: o.senderName,
          status: o.status,
          totalKobo: o.totalKobo,
        }))}
      />
    </div>
  );
}
