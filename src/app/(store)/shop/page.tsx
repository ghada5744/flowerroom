import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ShopSidebar } from "@/components/ShopSidebar";
import { ShopSort } from "@/components/ShopSort";
import { prisma } from "@/lib/prisma";
import { sortProducts } from "@/lib/sort-products";

export const dynamic = "force-dynamic";

export const metadata = { title: "Our Complete Range" };

type Props = { searchParams: Promise<{ q?: string; min?: string; max?: string; sort?: string }> };

export default async function ShopAllPage({ searchParams }: Props) {
  const sp = await searchParams;
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
  const filtered = sortProducts(matched, sp.sort, sales);

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
