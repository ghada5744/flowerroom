type Sortable = {
  id: string;
  name: string;
  featured: boolean;
  createdAt: Date;
  variants: { priceKobo: number }[];
};

export function sortProducts<T extends Sortable>(products: T[], sort: string | undefined, sales?: Map<string, number>) {
  const price = (p: T) => p.variants[0]?.priceKobo ?? 0;
  const copy = [...products];
  const byName = (a: T, b: T) => a.name.localeCompare(b.name);

  switch (sort) {
    case "az":
      return copy.sort(byName);
    case "za":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return copy.sort((a, b) => price(a) - price(b) || byName(a, b));
    case "price-desc":
      return copy.sort((a, b) => price(b) - price(a) || byName(a, b));
    case "new":
      return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "old":
      return copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case "best":
      return copy.sort(
        (a, b) => (sales?.get(b.id) ?? 0) - (sales?.get(a.id) ?? 0) || Number(b.featured) - Number(a.featured) || byName(a, b),
      );
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || byName(a, b));
  }
}
