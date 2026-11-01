import Link from "next/link";
import { formatNaira } from "@/lib/format";

const FALLBACK = "/images/lilac.jpg";

type Props = {
  name: string;
  slug: string;
  imageUrl?: string | null;
  fromKobo: number;
  badge?: string | null;
  soldOut?: boolean;
};

export function ProductCard({ name, slug, imageUrl, fromKobo, badge, soldOut = false }: Props) {
  return (
    <Link href={`/product/${slug}`} className={`product-card group${soldOut ? " is-sold-out" : ""}`}>
      <div className="product-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl || FALLBACK} alt={name} />
        {soldOut ? (
          <span className="product-card-badge product-card-badge-soldout">Sold out</span>
        ) : (
          badge && <span className="product-card-badge">{badge}</span>
        )}
      </div>
      <h3 className="product-card-title">{name}</h3>
      {fromKobo > 0 && (
        <p className="product-card-price">
          <em>from</em> <span>{formatNaira(fromKobo)}</span>
        </p>
      )}
      <span className="product-card-btn" style={{ color: "#ffffff" }}>
        View
      </span>
    </Link>
  );
}
