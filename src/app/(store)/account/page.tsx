import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { AccountLogoutButton } from "@/components/AccountLogoutButton";
import { getCurrentUser } from "@/lib/customer-auth";
import { formatNaira } from "@/lib/format";
import { HIDDEN_FROM_ACCOUNT } from "@/lib/order-lifecycle";
import { prisma } from "@/lib/prisma";

export default async function MyAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/account");

  // My orders = paid progress only (hide abandoned unpaid checkouts)
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: user.id }, { senderEmail: user.email }],
      status: { notIn: [...HIDDEN_FROM_ACCOUNT] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { payment: true, items: true },
  });

  return (
    <div className="site-wrap py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-magenta uppercase">My Account</p>
            <h1 className="mt-2 font-display text-5xl">Hello, {user.name.split(" ")[0]}</h1>
            <p className="mt-2 text-sm text-muted">{user.email}</p>
          </div>
          <AccountLogoutButton />
        </div>

        <section className="mt-10 border border-[#eadfce] bg-white p-6 md:p-8">
          <h2 className="font-display text-3xl">Account details</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="mt-0.5 font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-0.5 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="mt-0.5 font-medium">{user.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Offers & VIP</dt>
              <dd className="mt-0.5 font-medium">{user.marketingOptIn ? "Subscribed" : "Not subscribed"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 border border-[#eadfce] bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl">My orders</h2>
            <Link href="/shop" className="text-sm text-magenta hover:underline">
              Continue shopping
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">You haven&apos;t placed an order yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="mt-0.5 text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <p className="font-medium text-magenta">{formatNaira(order.totalKobo)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
