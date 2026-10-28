import { redirect } from "next/navigation";
import { AdminCustomersList } from "@/components/admin/AdminCustomersList";
import { paidUndeliveredWhere } from "@/lib/admin-orders";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: paidUndeliveredWhere,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalKobo: true,
          createdAt: true,
        },
      },
      _count: { select: { orders: { where: paidUndeliveredWhere } } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <p className="mt-2 text-sm text-muted">
        Name only by default — click the arrow for contact details and open paid orders
      </p>

      <AdminCustomersList
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          joinedLabel: new Date(c.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          paidCount: c._count.orders,
          vip: c.marketingOptIn,
          orders: c.orders,
        }))}
      />
    </div>
  );
}
