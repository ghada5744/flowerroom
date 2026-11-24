import { redirect } from "next/navigation";
import { AddonManager } from "@/components/admin/AddonManager";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAddonsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const addons = await prisma.addon.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] });

  return (
    <div>
      <h1 className="font-display text-3xl">Additions</h1>
      <p className="mt-2 text-sm text-muted">
        Cards, treats and balloons appear separately on bouquet/box pages (“Select card”, “Add a
        treat”, “Add balloons”). Set the ₦ price of each one here. Gift sets already include cake +
        card + balloons — those product pages hide this section.
      </p>
      <div className="mt-6">
        <AddonManager addons={addons} />
      </div>
    </div>
  );
}
