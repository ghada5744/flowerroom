/**
 * Sub-category filters used by the shop sidebar (?type=...&color=...).
 * Products are matched by keywords in their name, so naming a product
 * e.g. "Red Roses Bouquet" or "Giant Vase — Ivory" puts it in the right list.
 */
type TypeFilter = { label: string; test: (name: string) => boolean };

const has = (...words: string[]) => (name: string) => words.some((w) => name.includes(w));

export const SHOP_TYPE_FILTERS: Record<string, Record<string, TypeFilter>> = {
  "hand-tied-bouquets": {
    mixed: { label: "Mixed Bouquets", test: (n) => !n.includes("rose") },
    roses: { label: "Roses", test: has("rose") },
  },
  "signature-arrangements": {
    baskets: { label: "Baskets", test: has("basket") },
    "giant-vases": { label: "Giant Vases", test: has("vase") },
    "standing-bouquets": { label: "Standing Bouquets", test: has("standing") },
    "hat-boxes": { label: "Hat Boxes", test: has("box") },
  },
};

export const ROSE_COLORS = ["red", "pink", "white"] as const;

export function filterByType<T extends { name: string }>(
  category: string,
  products: T[],
  type?: string,
  color?: string,
) {
  const filter = type ? SHOP_TYPE_FILTERS[category]?.[type] : undefined;
  if (!filter) return { products, title: undefined as string | undefined };
  const c = color?.toLowerCase();
  const out = products.filter((p) => {
    const n = p.name.toLowerCase();
    return filter.test(n) && (!c || n.includes(c));
  });
  const title = c ? `${c[0].toUpperCase()}${c.slice(1)} ${filter.label}` : filter.label;
  return { products: out, title };
}
