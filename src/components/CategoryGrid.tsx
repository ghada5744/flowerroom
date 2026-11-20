import Link from "next/link";
import type { CategoryTile } from "@/lib/categories";

/** flowers.ae "Our Complete Range" style: square photo + bold underlined name */
export function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="range-grid">
      {tiles.map((c) => (
        <Link key={c.id} href={`/shop/${c.slug}`} className="range-card">
          <div className="range-card-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.label} loading="lazy" />
          </div>
          <span className="range-card-title">{c.label}</span>
        </Link>
      ))}
    </div>
  );
}
