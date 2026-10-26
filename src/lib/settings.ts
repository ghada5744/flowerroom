import { prisma } from "@/lib/prisma";

const FALLBACK = {
  id: "main",
  brandName: "FLOWER ROOM",
  tagline: "THE ART OF GIFTING",
  phone: process.env.NEXT_PUBLIC_PHONE || "+234 915 535 3128",
  email: "info@flowerroom.ng",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349155353128",
  facebookUrl: "https://www.facebook.com/p/Flower-Room-Nigeria-61581423721745/",
  instagramUrl: "https://www.instagram.com/flower_room_ng",
  tiktokUrl: "https://www.tiktok.com/@flowerroomng",
  bannerLeft: "8,000 + 5 Star reviews",
  bannerCenter: "Same-day delivery across Lagos",
  bannerRight: "Video Approval on all orders",
  heroTitle: "A Month in Pink",
  heroSubtitle:
    "Premium fresh flowers for Nigeria — wholesale & retail. Same-day delivery across Lagos.",
  heroImageUrl: "/images/hero.jpg",
  heroCtaLabel: "SHOP NOW",
  heroCtaHref: "/shop",
};

export async function getSiteSettings() {
  try {
    if (!prisma.siteSetting) {
      await import("@prisma/client").then(() => undefined);
    }
    let settings = await prisma.siteSetting.findUnique({ where: { id: "main" } });
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: "main" } });
    }
    return settings;
  } catch (err) {
    console.error("getSiteSettings failed, using fallback:", err);
    return FALLBACK;
  }
}
