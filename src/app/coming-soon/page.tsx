import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming soon · Flower Room",
  description: "Flower Room is preparing something beautiful. Same-day flowers across Lagos, opening soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="coming-soon">
      <div className="coming-soon-photo" aria-hidden />
      <div className="coming-soon-veil" />
      <div className="coming-soon-card">
        <p className="coming-soon-brand">Flower Room</p>
        <p className="coming-soon-tag">The art of gifting</p>
        <div className="coming-soon-rule" />
        <h1>Coming soon</h1>
        <p className="coming-soon-copy">
          Fresh flowers, gift sets and same-day delivery across Lagos. We are putting the finishing touches on the shop.
        </p>
        <a className="coming-soon-wa" href="https://wa.me/2349155353128" target="_blank" rel="noreferrer">
          WhatsApp us
        </a>
      </div>
    </main>
  );
}
