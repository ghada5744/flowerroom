import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);

  return (
    <>
      <Header settings={settings} categories={categories} />
      <main className="flex-1 bg-[#faf6ef]">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFab number={settings.whatsapp} />
    </>
  );
}
