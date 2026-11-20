import { Suspense } from "react";
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
