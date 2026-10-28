import { formatNaira } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";

type OrderMail = {
  id?: string;
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

type MailAudience = "customer" | "shop";

const COLORS = {
  cream: "#faf6ef",
  creamDeep: "#f3eee6",
  ink: "#1a1a1a",
  muted: "#6b6b6b",
  line: "#e5dfd6",
  magenta: "#c2185b",
  white: "#ffffff",
};

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://flowerroom.ng").replace(/\/$/, "");
}

function itemRows(order: OrderMail) {
  return order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${COLORS.line};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:${COLORS.ink}">
          <strong style="font-weight:600">${esc(item.productName)}</strong>
          <br/>
          <span style="color:${COLORS.muted};font-size:13px">${esc(item.variantName)} · Qty ${item.quantity}</span>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid ${COLORS.line};font-family:Arial,Helvetica,sans-serif;font-size:14px;text-align:right;vertical-align:top;color:${COLORS.ink};white-space:nowrap">
          ${esc(formatNaira(item.lineKobo))}
        </td>
      </tr>`,
    )
    .join("");
}

function detailBlock(label: string, bodyHtml: string, bottomGap = true) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};border:1px solid ${COLORS.line};margin:0 0 ${bottomGap ? "12px" : "0"}">
      <tr>
        <td style="padding:16px 18px">
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.magenta}">${esc(label)}</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${COLORS.ink}">${bodyHtml}</p>
        </td>
      </tr>
    </table>`;
}

function orderHtml(
  order: OrderMail,
  opts: {
    audience: MailAudience;
    brandName: string;
    tagline: string;
    phone: string;
    email: string;
    instagramUrl: string;
  },
) {
  const isShop = opts.audience === "shop";
  const preheader = isShop
    ? `New paid order ${order.orderNumber} — open it in admin.`
    : `Thank you — payment confirmed for order ${order.orderNumber}.`;
  const headline = isShop ? "New paid order" : "Payment confirmed";
  const intro = isShop
    ? "A customer has paid. Review the details below, then fulfil the order from your admin."
    : "Thank you for choosing Flower Room. Your payment is confirmed and our florists have your order.";
  const ctaLabel = isShop ? "Open in admin" : "View my orders";
  const ctaHref = isShop
    ? order.id
      ? `${siteBaseUrl()}/admin/orders/${order.id}`
      : `${siteBaseUrl()}/admin/orders`
    : `${siteBaseUrl()}/account`;

  const fromHtml = `${esc(order.senderName)}<br/>${esc(order.senderEmail)}<br/>${esc(order.senderPhone)}`;
  const toHtml = `${esc(order.recipientName)}<br/>${esc(order.recipientPhone)}<br/>${esc(order.deliveryAddress)}<br/>${esc(order.deliveryCity)}${
    order.deliveryDate ? `<br/>Delivery: ${esc(order.deliveryDate)}` : ""
  }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(opts.brandName)} · ${esc(order.orderNumber)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.cream};color:${COLORS.ink}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.white};border:1px solid ${COLORS.line}">
          <tr>
            <td style="padding:28px 28px 20px;text-align:center;border-bottom:1px solid ${COLORS.line};background:${COLORS.creamDeep}">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:0.12em;color:${COLORS.ink}">${esc(opts.brandName)}</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.muted}">${esc(opts.tagline)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px">
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.magenta}">${esc(order.orderNumber)}</p>
              <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:30px;line-height:1.2;color:${COLORS.ink}">${esc(headline)}</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.muted}">${esc(intro)}</p>
              <p style="margin:18px 0 0">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(194,24,91,0.08);border:1px solid rgba(194,24,91,0.16);font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${COLORS.magenta}">Paid</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 8px">
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.muted}">Order items</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows(order)}
                <tr>
                  <td style="padding:18px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:${COLORS.ink}">Total</td>
                  <td style="padding:18px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;text-align:right;color:${COLORS.magenta}">${esc(formatNaira(order.totalKobo))}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 8px">
              ${detailBlock("From", fromHtml)}
              ${detailBlock("Deliver to", toHtml, false)}
            </td>
          </tr>
          ${
            order.giftMessage
              ? `<tr>
            <td style="padding:16px 28px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};border:1px solid ${COLORS.line}">
                <tr>
                  <td style="padding:16px 18px">
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.magenta}">Gift message</p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.5;font-style:italic;color:${COLORS.ink}">“${esc(order.giftMessage)}”</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:28px;text-align:center">
              <a href="${esc(ctaHref)}" style="display:inline-block;padding:14px 28px;background:${COLORS.magenta};color:${COLORS.white};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase">${esc(ctaLabel)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${COLORS.line};text-align:center;background:${COLORS.creamDeep}">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${COLORS.muted}">
                ${esc(opts.phone)} · <a href="mailto:${esc(opts.email)}" style="color:${COLORS.magenta};text-decoration:none">${esc(opts.email)}</a>
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${COLORS.muted}">
                <a href="${esc(opts.instagramUrl)}" style="color:${COLORS.muted};text-decoration:underline">Instagram</a>
                · ${esc(opts.brandName)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set, so the order email was not sent.");
    return;
  }
  const from = process.env.RESEND_FROM || "Flower Room <info@flowerroom.ng>";
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
  const brand = {
    brandName: settings.brandName || "FLOWER ROOM",
    tagline: settings.tagline || "THE ART OF GIFTING",
    phone: settings.phone,
    email: settings.email,
    instagramUrl: settings.instagramUrl || "https://www.instagram.com/flower_room_ng",
  };

  await send(
    shopTo,
    `New paid order ${order.orderNumber}`,
    orderHtml(order, { audience: "shop", ...brand }),
  );
  await send(
    order.senderEmail,
    `Flower Room order ${order.orderNumber}`,
    orderHtml(order, { audience: "customer", ...brand }),
  );
}
