import { Suspense } from "react";
import Link from "next/link";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductCard } from "@/components/ProductCard";
import { ShopSidebar } from "@/components/ShopSidebar";
import { ShopSort } from "@/components/ShopSort";
import { getCategoryTiles } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { sortProducts } from "@/lib/sort-products";

export const dynamic = "force-dynamic";

export const metadata = { title: "Our Complete Range" };

type Props = { searchParams: Promise<{ q?: string; min?: string; max?: string; sort?: string }> };

export default async function ShopAllPage({ searchParams }: Props) {
  const sp = await searchParams;

  // Plain "Our Complete Range" (no search / price filter) = category photos, like flowers.ae
  if (!sp.q && !sp.min && !sp.max && !sp.sort) {
    const tiles = await getCategoryTiles();
    return (
      <div className="site-wrap py-10 md:py-14">
        <div className="main-rail-grid">
          <aside className="main-rail-left">
            <ShopSidebar categories={tiles.all} />
          </aside>
          <div className="main-rail-right">
            <div className="range-block">
              <div className="range-header">
                <h1 className="range-heading">Our Complete Range</h1>
                <p className="range-intro">
                  Our florists have a complete range of flowers for all occasions. From special
                  occasions such as birthdays, anniversaries and congratulations, to everyday
                  occasions such as Just Because, Get Well and Sympathy, we have the perfect
                  arrangement for every occasion.
                </p>
              </div>
              <CategoryGrid tiles={tiles.topLevel} />
            </div>
          </div>
        </div>

        <div className="range-seo">
          <h2>
            <b>Our Complete Range: Beautiful Flower Arrangements for Every Occasion</b>
          </h2>
          <p>
            <Link href="/">Flower Room NG</Link> has the best fresh flowers in Nigeria, with same-day
            flower delivery across Lagos. Presenting our complete range of floral arrangements, designed
            to add beauty, elegance and joy to your special moments. Whether you are celebrating a{" "}
            <Link href="/shop/gift-sets?occasion=birthday">birthday</Link>, an{" "}
            <Link href="/shop/gift-sets?occasion=anniversary">anniversary</Link> or a{" "}
            <Link href="/shop/events-bridal">wedding</Link>, or simply want to brighten someone&apos;s
            day, our <Link href="/shop/hand-tied-bouquets">hand-tied bouquets</Link>,{" "}
            <Link href="/shop/baskets">baskets</Link>, <Link href="/shop/hat-boxes">hat boxes</Link>{" "}
            and more will leave a lasting impression.
          </p>

          <h2>What collections are included in our complete range?</h2>
          <p>We&apos;ve gathered all of our designs into one easy-to-shop range. Here&apos;s what you can explore:</p>
          <p>
            <b>Hand Tied Bouquets</b> – Classic bouquets, from mixed seasonal blooms to our signature roses.
            <br />
            <b>Gift Sets</b> – Flowers paired with treats and extras for birthdays, anniversaries,
            congratulations and apologies.
            <br />
            <b>Signature Arrangements</b> – Our show-stoppers: baskets, giant vases, standing bouquets and
            hat boxes.
            <br />
            <b>Events &amp; Bridal</b> – Wedding flowers, centrepieces and arrangements for events and
            hotels.
            <br />
            <b>Add-ons</b> – Cakes, cards, balloons and treats to complete your gift.
            <br />
            <b>Plants</b> – Decorative plants and flowers for the home or office.
          </p>

          <h2>What types of flowers are available in our complete range?</h2>
          <p>We use only the freshest, premium-quality blooms in our arrangements. Expect to find:</p>
          <p>
            <b>Roses</b> – Timeless and romantic, in red, pink and white.
            <br />
            <b>Hydrangeas</b> – Full, soft and elegant, perfect for statement pieces.
            <br />
            <b>Orchids</b> – Exotic and luxurious, ideal for modern designs.
            <br />
            <b>Chrysanthemums</b> – Long-lasting and full of colour and texture.
            <br />
            <b>Spray roses &amp; statice</b> – Delicate fillers that make every arrangement feel lush.
            <br />
            And many more seasonal blooms throughout the range.
          </p>

          <h2>What delivery options are available?</h2>
          <p>
            Enjoy <b>same-day delivery across Lagos</b>. Perfect for last-minute surprises or
            spontaneous gifts. Once your flowers are arranged, we send you a video on WhatsApp or by
            email for your approval before delivery, so they arrive fresh, beautiful and on time.
          </p>
        </div>
      </div>
    );
  }

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(sp.q
          ? { OR: [{ name: { contains: sp.q } }, { description: { contains: sp.q } }] }
          : {}),
      },
      include: { variants: { where: { active: true }, orderBy: { priceKobo: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const min = sp.min ? Number(sp.min) * 100 : null;
  const max = sp.max ? Number(sp.max) * 100 : null;
  // Complete Range = flower products with prices (not enquire-only treats/events in the main grid)
  const matched = products.filter((p) => {
    const price = p.variants[0]?.priceKobo ?? 0;
    if (price <= 0) return false;
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    return true;
  });
  const sales =
    sp.sort === "best"
      ? new Map(
          (
            await prisma.orderItem.groupBy({
              by: ["productId"],
              _sum: { quantity: true },
            })
          ).map((row) => [row.productId, row._sum.quantity ?? 0]),
        )
      : undefined;
  const filtered = sp.sort ? sortProducts(matched, sp.sort, sales) : matched;

  return (
    <div className="site-wrap py-10 md:py-14">
      <h1 className="font-display mb-8 text-center text-[2rem] text-ink md:text-[2.5rem]">
        Our Complete Range
      </h1>
      <div className="main-rail-grid">
        <aside className="main-rail-left">
          <ShopSidebar categories={categories} />
        </aside>
        <div className="main-rail-right">
          <Suspense fallback={null}>
            <ShopSort />
          </Suspense>
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                slug={p.slug}
                imageUrl={p.imageUrl}
                fromKobo={p.variants[0]?.priceKobo ?? 0}
                badge={p.badge}
                soldOut={p.soldOut}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-muted">No products match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
