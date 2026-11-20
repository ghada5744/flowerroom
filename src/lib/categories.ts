import { prisma } from "@/lib/prisma";

export const FALLBACK_TILE_IMAGE = "/images/lilac.jpg";

/** Shorter names for tiles / menu where the real category name is long */
export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  "gift-sets": "Gift Sets",
  "sweet-savoury": "Add-ons",
  plants: "Plants",
};

export type CategoryTile = { id: string; name: string; slug: string; label: string; image: string };

/**
 * All categories + a tile photo for each:
 * its own photo (admin → Sections) → first product photo inside it (or its sub-categories)
 * → its parent's photo → placeholder.
 */
export async function getCategoryTiles() {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { active: true, imageUrl: { not: null } },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        select: { imageUrl: true },
        take: 1,
      },
    },
  });

  const byId = new Map(cats.map((c) => [c.id, c]));
  const childrenOf = (id: string | null) => cats.filter((c) => c.parentId === id);

  const subtreeImage = (id: string): string | null => {
    const c = byId.get(id);
    if (!c) return null;
    if (c.imageUrl) return c.imageUrl;
    if (c.products[0]?.imageUrl) return c.products[0].imageUrl;
    for (const child of childrenOf(id)) {
      const img = subtreeImage(child.id);
      if (img) return img;
    }
    return null;
  };

  const imageFor = (id: string): string => {
    let cur = byId.get(id);
    while (cur) {
      const img = subtreeImage(cur.id);
      if (img) return img;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return FALLBACK_TILE_IMAGE;
  };

  const tile = (c: (typeof cats)[number]): CategoryTile => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    label: CATEGORY_SHORT_LABELS[c.slug] ?? c.name,
    image: imageFor(c.id),
  });

  return {
    all: cats,
    topLevel: childrenOf(null).map(tile),
    childrenTiles: (id: string) => childrenOf(id).map(tile),
  };
}
