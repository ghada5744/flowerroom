import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/products" className="text-sm text-muted hover:text-magenta">
            ← Products
          </Link>
          <h1 className="mt-2 font-display text-3xl">Edit product</h1>
        </div>
        <ProductDeleteButton id={product.id} name={product.name} />
      </div>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
