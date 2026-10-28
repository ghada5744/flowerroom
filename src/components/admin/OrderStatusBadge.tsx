import { orderStatusLabel, orderStatusTone } from "@/lib/order-lifecycle";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`order-status-badge tone-${orderStatusTone(status)}`}>
      {orderStatusLabel(status)}
    </span>
  );
}
