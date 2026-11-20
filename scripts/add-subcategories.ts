/**
 * Creates the shop sub-categories and moves existing products into them.
 * Safe to run more than once (it only creates what is missing).
 *
 *   npx tsx scripts/add-subcategories.ts
 *
 * Hand Tied Bouquets → Mixed Bouquets, Roses (→ Red, Pink, White)
 * Signature Arrangements → Baskets, Giant Vases, Standing Bouquets, Hat Boxes
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Node = { slug: string; name: string; children?: Node[]; products?: (name: string) => boolean };

const TREE: Record<string, Node[]> = {
  "hand-tied-bouquets": [
    { slug: "mixed-bouquets", name: "Mixed Bouquets", products: (n) => !/rose/i.test(n) },
    {
      slug: "roses",
      name: "Roses",
      products: (n) => /rose/i.test(n),
      children: [
        { slug: "red-roses", name: "Red Roses" },
        { slug: "pink-roses", name: "Pink Roses" },
        { slug: "white-roses", name: "White Roses" },
      ],
    },
  ],
  "signature-arrangements": [
    { slug: "baskets", name: "Baskets", products: (n) => /basket/i.test(n) },
    { slug: "giant-vases", name: "Giant Vases", products: (n) => /vase/i.test(n) },
    { slug: "standing-bouquets", name: "Standing Bouquets", products: (n) => /standing/i.test(n) },
    { slug: "hat-boxes", name: "Hat Boxes", products: (n) => /box/i.test(n) },
  ],
};

async function ensure(parentId: string, parentProducts: { id: string; name: string }[], nodes: Node[]) {
  for (const [i, node] of nodes.entries()) {
    const cat = await prisma.category.upsert({
      where: { slug: node.slug },
      update: { parentId },
      create: { slug: node.slug, name: node.name, parentId, sortOrder: i },
    });
    console.log(`✓ ${node.name}`);

    if (node.products) {
      const moving = parentProducts.filter((p) => node.products!(p.name));
      for (const p of moving) {
        await prisma.product.update({ where: { id: p.id }, data: { categoryId: cat.id } });
        console.log(`    → ${p.name}`);
      }
    }
    if (node.children) await ensure(cat.id, [], node.children);
  }
}

async function main() {
  for (const [parentSlug, nodes] of Object.entries(TREE)) {
    const parent = await prisma.category.findUnique({
      where: { slug: parentSlug },
      include: { products: { select: { id: true, name: true } } },
    });
    if (!parent) {
      console.warn(`! ${parentSlug} not found — skipped`);
      continue;
    }
    console.log(`\n${parent.name}`);
    await ensure(parent.id, parent.products, nodes);
  }
}

main().finally(() => prisma.$disconnect());
