import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { deliveredWhere, paidRevenueWhere, paidUndeliveredWhere } from "@/lib/admin-orders";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [undeliveredCount, deliveredCount, paidOrders, productCount, customerCount, recent] =
    await Promise.all([
      prisma.order.count({ where: paidUndeliveredWhere }),
      prisma.order.count({ where: deliveredWhere }),
      prisma.order.findMany({ where: paidRevenueWhere, select: { totalKobo: true } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({
        where: paidUndeliveredWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { payment: true },
      }),
    ]);

  const revenue = paidOrders.reduce((n, o) => n + o.totalKobo, 0);

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Manage your whole shop here: add or delete products, organise sections, update add-ons, and track
        every order and customer. Photos are uploaded from your device — no image links needed.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn-primary">
          + Add product
        </Link>
        <Link href="/admin/categories" className="btn-ghost">
          Manage sections
        </Link>
        <Link href="/admin/orders" className="btn-ghost">
          View orders
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="admin-stat-card admin-stat-priority">
          <p className="text-xs uppercase tracking-wider text-muted">Undelivered orders</p>
          <p className="font-display mt-2 text-3xl text-magenta">{undeliveredCount}</p>
          <Link href="/admin/orders" className="mt-2 inline-block text-xs text-magenta hover:underline">
            Open orders →
          </Link>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs uppercase tracking-wider text-muted">Delivered orders</p>
          <p className="font-display mt-2 text-3xl">{deliveredCount}</p>
          <Link href="/admin/orders/delivered" className="mt-2 inline-block text-xs text-magenta hover:underline">
            View delivered →
          </Link>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs uppercase tracking-wider text-muted">Paid revenue</p>
          <p className="font-display mt-2 text-3xl text-magenta">{formatNaira(revenue)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs uppercase tracking-wider text-muted">Products</p>
          <p className="font-display mt-2 text-3xl">{productCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs uppercase tracking-wider text-muted">Customers</p>
          <p className="font-display mt-2 text-3xl">{customerCount}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent undelivered orders</h2>
          <Link href="/admin/orders" className="text-sm text-magenta hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-magenta hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.senderName}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">{formatNaira(o.totalKobo)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No open paid orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
