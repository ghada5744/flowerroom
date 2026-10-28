import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductsFilterTable } from "@/components/admin/ProductsFilterTable";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [products, sections] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        variants: { orderBy: { priceKobo: "asc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    active: p.active,
    category: { id: p.category.id, name: p.category.name },
    fromKobo: p.variants[0]?.priceKobo ?? 0,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Add, edit or delete anything in the shop. Filter by name or section below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/categories" className="btn-ghost">
            Manage sections
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            + Add product
          </Link>
        </div>
      </div>

      <ProductsFilterTable
        products={rows}
        sections={sections.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
