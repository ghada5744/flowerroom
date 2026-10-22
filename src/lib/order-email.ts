import { formatNaira } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";

type OrderMail = {
  orderNumber: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryDate: string | null;
  giftMessage: string | null;
  totalKobo: number;
  items: { productName: string; variantName: string; quantity: number; lineKobo: number }[];
};

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function orderHtml(order: OrderMail, intro: string) {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(item.productName)} · ${esc(item.variantName)} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${esc(formatNaira(item.lineKobo))}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:Georgia,serif;color:#1a1a1a;max-width:560px">
      <p style="letter-spacing:0.14em;font-size:13px">FLOWER ROOM</p>
      <h1 style="font-weight:500;font-size:28px;margin:8px 0 12px">Order ${esc(order.orderNumber)}</h1>
      <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">${esc(intro)}</p>
      <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;margin-top:16px">${rows}</table>
      <p style="font-family:Arial,sans-serif;font-size:16px"><strong>Total ${esc(formatNaira(order.totalKobo))}</strong> · Paid</p>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.55">
        From ${esc(order.senderName)} · ${esc(order.senderPhone)}<br/>
        To ${esc(order.recipientName)} · ${esc(order.recipientPhone)}<br/>
        ${esc(order.deliveryAddress)}, ${esc(order.deliveryCity)}
        ${order.deliveryDate ? `<br/>Delivery date ${esc(order.deliveryDate)}` : ""}
        ${order.giftMessage ? `<br/>Gift message: ${esc(order.giftMessage)}` : ""}
      </p>
    </div>
  `;
}

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set, so the order email was not sent.");
    return;
  }
  const from = process.env.RESEND_FROM || "Flower Room <orders@flowerroom.ng>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

export async function sendPaidOrderEmails(order: OrderMail) {
  const settings = await getSiteSettings();
  const shopTo = process.env.ORDER_NOTIFY_EMAIL || settings.email;
  await send(
    shopTo,
    `New paid order ${order.orderNumber}`,
    orderHtml(order, "A customer has paid. The order is in the admin list."),
  );
  await send(
    order.senderEmail,
    `Flower Room order ${order.orderNumber}`,
    orderHtml(order, "Thank you. Your payment is confirmed and the florist has the order."),
  );
}
