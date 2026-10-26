"use client";

import { useRef } from "react";
import { GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";

type Review = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  rating: number;
  sourceUrl?: string | null;
};

const TIMES = [
  "3 hours ago",
  "5 hours ago",
  "8 hours ago",
  "19 hours ago",
  "1 day ago",
  "2 days ago",
  "3 days ago",
  "5 days ago",
  "1 week ago",
  "2 weeks ago",
];

function TpStars({ size = 18 }: { size?: number }) {
  return (
    <span className="tp-stars" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="tp-star" style={{ width: size, height: size }}>
          <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} aria-hidden>
            <path
              fill="#fff"
              d="M12 2.5l2.6 6.6H22l-5.4 4.2 2.1 6.7L12 15.8 5.3 20l2.1-6.7L2 9.1h7.4z"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}

/** Left column block — sits above the sticky sidebar (flowers.ae) */
export function ReviewsSummary({ total = 5 }: { total?: number }) {
  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="reviews-summary reviews-summary-link"
    >
      <p className="reviews-excellent">Excellent</p>
      <div className="mt-1.5">
        <TpStars size={20} />
      </div>
      <p className="mt-2 text-[12px] text-[#555]">
        Based on <span className="underline decoration-[#bbb]">{total.toLocaleString()}</span> reviews
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[#4285f4]">
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </p>
    </a>
  );
}

/** Right column carousel with circular prev/next */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 400, behavior: "smooth" });
  }

  return (
    <div>
      <div className="reviews-carousel">
        <button
          type="button"
          aria-label="Previous reviews"
          onClick={() => scrollBy(-1)}
          className="review-nav"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div ref={trackRef} className="reviews-track">
          {reviews.map((r, i) => {
            const href = r.sourceUrl || GOOGLE_REVIEWS_URL;
            return (
              <a
                key={r.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="review-card"
                aria-label={`Read ${r.authorName}'s Google review`}
              >
                <div className="flex items-center gap-2.5">
                  <TpStars size={16} />
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <span className="verified-dot" aria-hidden>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                      </svg>
                    </span>
                    Google
                  </span>
                </div>
                <p className="review-card-meta">
                  <span className="font-semibold text-ink">{r.authorName}</span>
                  <span className="text-[#888]">, {TIMES[i % TIMES.length]}</span>
                </p>
                <p className="review-card-title">{r.title}</p>
                <p className="review-card-body">{r.body}</p>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Next reviews"
          onClick={() => scrollBy(1)}
          className="review-nav"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[#666]">
        Showing our 5 star Google reviews ·{" "}
        <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-magenta">
          See all on Google
        </a>
      </p>
    </div>
  );
}

/** Legacy full-width strip (unused on home — kept for other pages if needed) */
export function ReviewsStrip({ reviews }: { reviews: Review[] }) {
  return (
    <section className="trust-bar">
      <div className="site-wrap">
        <div className="reviews-row">
          <ReviewsSummary total={reviews.length} />
          <div className="min-w-0 flex-1">
            <ReviewsCarousel reviews={reviews} />
          </div>
        </div>
      </div>
    </section>
  );
}
