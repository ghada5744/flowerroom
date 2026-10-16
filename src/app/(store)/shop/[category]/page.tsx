import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ShopSidebar } from "@/components/ShopSidebar";
import { ShopSort } from "@/components/ShopSort";
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
  const [cat, categories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: category },
      include: {
        products: {
          where: { active: true },
          include: { variants: { where: { active: true }, orderBy: { priceKobo: "asc" } } },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!cat) notFound();
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
  const products = sortProducts(cat.products, sp.sort, sales);

  return (
    <div className="site-wrap py-10 md:py-14">
      <h1 className="font-display mb-2 text-center text-[2rem] text-ink md:text-[2.5rem]">{cat.name}</h1>
      {cat.description && (
        <p className="mx-auto mb-8 max-w-xl text-center text-[15px] text-muted">{cat.description}</p>
      )}
      <div className="main-rail-grid">
        <aside className="main-rail-left">
          <ShopSidebar categories={categories} />
        </aside>
        <div className="main-rail-right">
          <Suspense fallback={null}>
            <ShopSort />
          </Suspense>
          <div className="product-grid">
            {products.map((p) => (
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
        </div>
      </div>
    </div>
  );
}
