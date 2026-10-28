import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  // Only real paid orders — hide abandoned / cancelled / unpaid checkouts
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: "PAID" },
        { payment: { status: { in: ["paid", "demo_paid"] } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted">Showing orders with successful payment only.</p>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-magenta">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3">{o.senderName}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3">{o.payment?.status || "—"}</td>
                <td className="px-4 py-3">{formatNaira(o.totalKobo)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No paid orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
