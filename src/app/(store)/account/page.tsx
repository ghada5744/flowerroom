import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountLogoutButton } from "@/components/AccountLogoutButton";
import { AccountOrdersPanel } from "@/components/AccountOrdersPanel";
import { getCurrentUser } from "@/lib/customer-auth";
import { HIDDEN_FROM_ACCOUNT } from "@/lib/order-lifecycle";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/account");

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: user.id }, { senderEmail: user.email }],
      status: { notIn: [...HIDDEN_FROM_ACCOUNT] },
      customerHidden: false,
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
          <AccountOrdersPanel
            orders={orders.map((order) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              totalKobo: order.totalKobo,
              createdAtLabel: new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              senderName: order.senderName,
              senderPhone: order.senderPhone,
              recipientName: order.recipientName,
              recipientPhone: order.recipientPhone,
              deliveryAddress: order.deliveryAddress,
              deliveryCity: order.deliveryCity,
              deliveryDate: order.deliveryDate,
              giftMessage: order.giftMessage,
              items: order.items.map((item) => ({
                id: item.id,
                productName: item.productName,
                variantName: item.variantName,
                quantity: item.quantity,
                lineKobo: item.lineKobo,
              })),
            }))}
          />
        </section>
      </div>
    </div>
  );
}
