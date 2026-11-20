"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  _count: { products: number };
};

/** Sections in tree order with their depth (top level = 0) */
function flattenTree(categories: Category[]) {
  const out: { cat: Category; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of categories.filter((x) => x.parentId === parentId)) {
      out.push({ cat: c, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  // Anything whose parent no longer exists still shows up
  for (const c of categories) if (!out.some((o) => o.cat.id === c.id)) out.push({ cat: c, depth: 0 });
  return out;
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [photoId, setPhotoId] = useState<string | null>(null);
  const tree = flattenTree(categories);

  async function update(id: string, data: Record<string, unknown>) {
    setError("");
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not save");
      return false;
    }
    router.refresh();
    return true;
  }

  async function createSection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description") || null,
        parentId: form.get("parentId") || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create section");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function saveRename(id: string) {
    if (await update(id, { name: editName })) setEditingId(null);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete section “${name}”?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not delete");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form onSubmit={createSection} className="h-fit space-y-3 border border-line bg-white p-5">
        <h2 className="font-display text-2xl">Add section</h2>
        <p className="text-sm text-muted">
          A section is a shop category. Pick a parent to make it a sub-section — for example
          <em> Hat Boxes</em> inside <em>Signature Arrangements</em>.
        </p>
        <div>
          <label className="label">Name</label>
          <input name="name" className="input" required placeholder="e.g. Giant Vases" />
        </div>
        <div>
          <label className="label">Inside (parent)</label>
          <select name="parentId" className="input" defaultValue="">
            <option value="">— Top level (shows on the homepage) —</option>
            {tree.map(({ cat, depth }) => (
              <option key={cat.id} value={cat.id}>
                {"  ".repeat(depth * 2)}
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Short description (optional)</label>
          <input name="description" className="input" placeholder="Shown under the title on its page" />
        </div>
        {error && <p className="text-sm text-magenta">{error}</p>}
        <button type="submit" className="btn-primary">
          Add section
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm text-muted">
          Each section shows as a photo tile. Add a photo to choose what customers see — otherwise the
          first product photo inside it is used.
        </p>
        <ul className="space-y-2">
          {tree.map(({ cat: c, depth }) => (
            <li
              key={c.id}
              className="border border-line bg-white px-4 py-3 text-sm"
              style={{ marginLeft: `${depth * 1.5}rem` }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden border border-line bg-cream">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-center text-[10px] text-muted">
                      No photo
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {editingId === c.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="input max-w-xs"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-primary px-3 py-2 text-xs"
                        onClick={() => saveRename(c.id)}
                      >
                        Save
                      </button>
                      <button type="button" className="text-xs text-muted" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-muted">
                        {c._count.products} product{c._count.products === 1 ? "" : "s"} · /shop/{c.slug}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-ink hover:text-magenta"
                    onClick={() => setPhotoId(photoId === c.id ? null : c.id)}
                  >
                    Photo
                  </button>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-ink hover:text-magenta"
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-magenta"
                    onClick={() => remove(c.id, c.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                <span>Inside:</span>
                <select
                  className="input max-w-xs py-1.5 text-[13px]"
                  value={c.parentId ?? ""}
                  onChange={(e) => update(c.id, { parentId: e.target.value || null })}
                >
                  <option value="">— Top level —</option>
                  {tree
                    .filter(({ cat }) => cat.id !== c.id)
                    .map(({ cat, depth: d }) => (
                      <option key={cat.id} value={cat.id}>
                        {"  ".repeat(d * 2)}
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {photoId === c.id && (
                <div className="mt-4 border-t border-line pt-4">
                  <ImageUpload
                    value={c.imageUrl}
                    folder="categories"
                    label={`Tile photo for “${c.name}”`}
                    onChange={(url) => update(c.id, { imageUrl: url })}
                  />
                </div>
              )}
            </li>
          ))}
          {categories.length === 0 && (
            <li className="border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-muted">
              No sections yet — add one on the left.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
