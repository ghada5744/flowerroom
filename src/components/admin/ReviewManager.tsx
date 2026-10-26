"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  rating: number;
  sourceUrl?: string | null;
  published: boolean;
  sortOrder: number;
};

export function ReviewManager({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function createReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: form.get("authorName"),
        title: form.get("title"),
        body: form.get("body"),
        rating: Number(form.get("rating") || 5),
        sourceUrl: String(form.get("sourceUrl") || "").trim() || null,
        published: true,
        sortOrder: Number(form.get("sortOrder") || 0),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={createReview} className="space-y-4 border border-line bg-white p-5">
        <h2 className="font-display text-2xl">Add review</h2>
        <div>
          <label className="label" htmlFor="authorName">Author</label>
          <input id="authorName" name="authorName" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="body">Body</label>
          <textarea id="body" name="body" className="input min-h-24" required />
        </div>
        <div>
          <label className="label" htmlFor="sourceUrl">Google review link (optional)</label>
          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            className="input"
            placeholder="https://www.google.com/maps/..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="rating">Rating</label>
            <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={5} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="sortOrder">Sort</label>
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={0} className="input" />
          </div>
        </div>
        {error && <p className="text-sm text-magenta">{error}</p>}
        <button type="submit" className="btn-primary">
          Publish review
        </button>
      </form>

      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted">{r.authorName} · {r.rating}★</p>
                <p className="mt-2 text-sm">{r.body}</p>
                {r.sourceUrl && (
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-magenta hover:underline"
                  >
                    Open on Google
                  </a>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2 text-xs">
                <button
                  type="button"
                  className="text-magenta hover:underline"
                  onClick={() => togglePublish(r.id, r.published)}
                >
                  {r.published ? "Unpublish" : "Publish"}
                </button>
                <button type="button" className="text-muted hover:underline" onClick={() => remove(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
