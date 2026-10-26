import { redirect } from "next/navigation";
import { ReviewManager } from "@/components/admin/ReviewManager";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export default async function AdminReviewsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const reviews = await prisma.review.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <p className="mt-2 text-sm text-muted">
        Publish 5★ Google reviews on the homepage. Add the Google Maps review link so cards open the real review.
      </p>
      <div className="mt-6">
        <ReviewManager reviews={reviews} />
      </div>
    </div>
  );
}
