import Link from "next/link";

export function OrdersTabs({ active }: { active: "open" | "delivered" }) {
  return (
    <div className="orders-tabs" role="tablist" aria-label="Order lists">
      <Link
        href="/admin/orders"
        className={`orders-tab${active === "open" ? " is-active" : ""}`}
        role="tab"
        aria-selected={active === "open"}
      >
        Open
      </Link>
      <Link
        href="/admin/orders/delivered"
        className={`orders-tab${active === "delivered" ? " is-active" : ""}`}
        role="tab"
        aria-selected={active === "delivered"}
      >
        Delivered
      </Link>
    </div>
  );
}
