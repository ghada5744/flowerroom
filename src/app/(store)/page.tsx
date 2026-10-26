import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ProductCard } from "@/components/ProductCard";
import { ReviewsCarousel, ReviewsSummary } from "@/components/ReviewsStrip";
import { ShopSidebar } from "@/components/ShopSidebar";
import { SubscribeStrip } from "@/components/SubscribeStrip";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allPriced, reviews, faqs, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        variants: { some: { active: true, priceKobo: { gt: 0 } } },
      },
      include: { variants: { where: { active: true }, orderBy: { priceKobo: "asc" } } },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      take: 8,
    }),
    prisma.review.findMany({
      where: { published: true, rating: 5 },
      orderBy: { sortOrder: "asc" },
      take: 12,
    }),
    prisma.faq.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);

  const featured = allPriced.slice(0, 4);
  const more = allPriced.slice(4, 8);

  const faqList =
    faqs.length > 0
      ? faqs
      : [
          {
            id: "1",
            question: "Where do you deliver?",
            answer: "Same-day delivery to all Lagos.",
          },
          {
            id: "2",
            question: "Can I see the flowers before you send them?",
            answer:
              "Yes. Once arranged, your florist will send a video via WhatsApp or email for your approval before delivery.",
          },
        ];

  return (
    <>
      <section className="hero-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-banner-img" src={settings.heroImageUrl} alt={settings.heroTitle} />
        <div className="hero-banner-overlay">
          <div className="hero-copy">
            <h1>{settings.heroTitle}</h1>
            <p>{settings.heroSubtitle}</p>
            <Link href={settings.heroCtaHref} className="btn-shop hero-cta">
              {settings.heroCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/*
        flowers.ae: LEFT COLUMN stretches full height of products+FAQ+subscribe.
        Sticky nav lives inside that column so the rail never “ends” early.
      */}
      <section className="site-wrap main-rail">
        <div className="main-rail-grid">
          <aside className="main-rail-left">
            <div className="main-rail-left-sticky">
              <ReviewsSummary total={reviews.length} />
              <div className="main-rail-nav">
                <ShopSidebar categories={categories} />
              </div>
            </div>
          </aside>

          <div className="main-rail-right">
            <ReviewsCarousel reviews={reviews} />

            <div className="product-grid mt-8">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  slug={p.slug}
                  imageUrl={p.imageUrl}
                  fromKobo={p.variants[0]?.priceKobo ?? 0}
                  badge={p.badge}
                />
              ))}
            </div>
            {more.length > 0 && (
              <div className="product-grid mt-8">
                {more.map((p) => (
                  <ProductCard
                    key={p.id}
                    name={p.name}
                    slug={p.slug}
                    imageUrl={p.imageUrl}
                    fromKobo={p.variants[0]?.priceKobo ?? 0}
                    badge={p.badge}
                  />
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-flex bg-black px-10 py-3.5 text-[14px] font-medium tracking-wide text-white hover:bg-[#222]"
                style={{ color: "#ffffff" }}
              >
                Complete Range
              </Link>
            </div>

            <div className="about-block">
              <h2>Flower Delivery Lagos</h2>
              <p>
                At <strong>Flower Room NG</strong> we have the best fresh flowers in Nigeria —
                wholesale and retail. Hand-tied bouquets, baskets, boxes and large arrangements with
                same-day delivery to all Lagos. Video approval on every order via WhatsApp or email.
              </p>
            </div>

            <div id="faqs" className="faq-block">
              <h2 className="faq-heading">FAQ&apos;s</h2>
              <FaqAccordion faqs={faqList} />
            </div>

            <SubscribeStrip />
          </div>
        </div>
      </section>
    </>
  );
}
