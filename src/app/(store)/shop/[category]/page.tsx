import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductCard } from "@/components/ProductCard";
import { ShopSidebar } from "@/components/ShopSidebar";
import { ShopSort } from "@/components/ShopSort";
import { getCategoryTiles } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { sortProducts } from "@/lib/sort-products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ sort?: string }> };

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const cat = await prisma.category.findUnique({ where: { slug: category } });
  return { title: cat?.name || "Shop" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  const [cat, tiles] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: category },
      include: {
        parent: { select: { name: true, slug: true } },
        products: {
          where: { active: true },
          include: { variants: { where: { active: true }, orderBy: { priceKobo: "asc" } } },
          orderBy: { name: "asc" },
        },
      },
    }),
    getCategoryTiles(),
  ]);
  if (!cat) notFound();

  const subTiles = tiles.childrenTiles(cat.id);
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
  const products = sp.sort ? sortProducts(cat.products, sp.sort, sales) : cat.products;

  return (
    <div className="site-wrap py-10 md:py-14">
      {cat.parent && (
        <p className="mb-2 text-center text-[13px]">
          <Link href={`/shop/${cat.parent.slug}`} className="text-muted underline underline-offset-2 hover:text-ink">
            ← {cat.parent.name}
          </Link>
        </p>
      )}
      <h1 className="font-display mb-2 text-center text-[2rem] text-ink md:text-[2.5rem]">{cat.name}</h1>
      {cat.description && (
        <p className="mx-auto mb-8 max-w-xl text-center text-[15px] text-muted">{cat.description}</p>
      )}
      <div className="main-rail-grid">
        <aside className="main-rail-left">
          <ShopSidebar categories={tiles.all} />
        </aside>
        <div className="main-rail-right">
          {subTiles.length > 0 && (
            <div className={products.length > 0 ? "mb-12" : undefined}>
              <CategoryGrid tiles={subTiles} />
            </div>
          )}

          {products.length > 0 && (
            <>
              <Suspense fallback={null}>
                <ShopSort />
              </Suspense>
              <div className="product-grid product-grid--category">
                {products.map((p) => (
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
            </>
          )}

          {subTiles.length === 0 && products.length === 0 && (
            <p className="py-10 text-center text-[15px] text-muted">
              No arrangements here yet — please check back soon or message us on WhatsApp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
