import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductGallery } from "@/components/ProductGallery";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name || "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, wrappers, cards, treats, balloons, related] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.addon.findMany({ where: { type: "wrapper", active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.addon.findMany({ where: { type: "card", active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.addon.findMany({ where: { type: "treat", active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.addon.findMany({ where: { type: "balloon", active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true, slug: { not: slug }, featured: true },
      include: { variants: { where: { active: true }, orderBy: { priceKobo: "asc" } } },
      take: 4,
    }),
  ]);
  if (!product || !product.active) notFound();

  const isGiftSet = product.category.slug === "gift-sets";
  const gallery =
    product.images.length > 0
      ? product.images.map((img) => img.url)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  return (
    <div className="site-wrap py-8 md:py-14">
      <p className="text-[12px] tracking-[0.08em] text-muted uppercase">
        <Link href="/" className="hover:text-magenta">
          Home
        </Link>
        <span className="px-2 text-[#c8c0b6]">/</span>
        <Link href={`/shop/${product.category.slug}`} className="hover:text-magenta">
          {product.category.name}
        </Link>
        <span className="px-2 text-[#c8c0b6]">/</span>
        <span className="text-ink">{product.name}</span>
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:items-start">
        <ProductGallery images={gallery} name={product.name} badge={product.badge} />

        <div className="product-detail-copy">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-magenta uppercase">{product.category.name}</p>
          <h1 className="mt-2 font-display text-[2.6rem] leading-[1.05] text-ink md:text-5xl">{product.name}</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#4a4a4a]">{product.description}</p>

          {isGiftSet && (
            <div className="panel-soft mt-5 px-4 py-3.5 text-sm text-[#333]">
              <p className="font-semibold text-magenta">Included in the set price</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Flower arrangement</li>
                <li>Bento cake</li>
                <li>Card</li>
                <li>Helium balloon(s)</li>
              </ul>
              <p className="mt-2 text-[12px] text-muted">
                Cake, card and balloons come with this set — they are not an extra charge on top.
              </p>
            </div>
          )}

          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-magenta">Video approval.</span>{" "}
            {product.videoNote ||
              "Once arranged, your florist will send a video via WhatsApp or email for your approval before delivery."}
          </p>

          <div className="mt-6">
            <ProductConfigurator
              productId={product.id}
              slug={product.slug}
              productName={product.name}
              imageUrl={product.imageUrl}
              variants={product.variants}
              wrappers={wrappers}
              cards={cards}
              treats={treats}
              balloons={balloons}
              isGiftSet={isGiftSet}
            />
          </div>

          {product.specs && !isGiftSet && (
            <details className="mt-8 border-t border-[#e8e2d8] pt-4">
              <summary className="cursor-pointer text-[13px] font-semibold tracking-wide uppercase">
                Product specifications
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm text-[#555]">{product.specs}</p>
            </details>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-[#e8e2d8] pt-12">
          <h2 className="font-display mb-8 text-center text-3xl">You may also like</h2>
          <div className="product-grid product-grid--compact">
            {related.map((p) => (
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
        </section>
      )}
    </div>
  );
}
