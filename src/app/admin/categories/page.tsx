import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Shop sections</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The categories products appear under. Top-level sections show on the homepage; sub-sections
        (e.g. Hat Boxes inside Signature Arrangements) show as photo tiles when a customer opens the
        parent. Add a photo to each so customers can see what&apos;s inside.
      </p>
      <div className="mt-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
