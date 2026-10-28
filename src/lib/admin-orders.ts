/** Paid orders still being fulfilled (not delivered yet). */
export const OPEN_FULFILLMENT_STATUSES = [
  "PAID",
  "ARRANGING",
  "VIDEO_APPROVED",
  "OUT_FOR_DELIVERY",
] as const;

export const paidUndeliveredWhere = {
  OR: [
    { status: { in: [...OPEN_FULFILLMENT_STATUSES] } },
    {
      AND: [
        { payment: { status: { in: ["paid", "demo_paid"] } } },
        {
          status: {
            notIn: ["DELIVERED", "CANCELLED", "PENDING", "AWAITING_PAYMENT"],
          },
        },
      ],
    },
  ],
};

export const deliveredWhere = { status: "DELIVERED" as const };

export const paidRevenueWhere = {
  OR: [
    { status: { in: [...OPEN_FULFILLMENT_STATUSES, "DELIVERED"] } },
    { payment: { status: { in: ["paid", "demo_paid"] } } },
  ],
};
