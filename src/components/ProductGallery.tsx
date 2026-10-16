"use client";

import { useState } from "react";

type Props = {
  images: string[];
  name: string;
  badge?: string | null;
};

export function ProductGallery({ images, name, badge }: Props) {
  const photos = images.filter(Boolean);
  const list = photos.length > 0 ? photos : ["/images/lilac.jpg"];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="product-gallery">
      <div className="product-gallery-stage">
        {badge && <span className="product-gallery-badge">{badge}</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={current} src={current} alt={name} className="product-gallery-main" />
      </div>

      {list.length > 0 && (
        <div className="product-gallery-thumbs" role="tablist" aria-label="More photos">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`product-gallery-thumb ${i === active ? "is-active" : ""} ${i % 2 === 0 ? "is-tall" : "is-short"}`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
