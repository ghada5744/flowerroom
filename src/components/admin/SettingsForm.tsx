"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Settings = {
  brandName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  bannerLeft: string;
  bannerCenter: string;
  bannerRight: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaLabel: string;
  heroCtaHref: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl || "/images/hero.jpg");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const form = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(form.entries()), heroImageUrl };
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    setMsg(res.ok ? "Saved" : "Save failed");
    if (res.ok) router.refresh();
  }

  const fields: [string, string, string][] = [
    ["brandName", "Brand name", settings.brandName],
    ["tagline", "Tagline", settings.tagline],
    ["phone", "Phone", settings.phone],
    ["email", "Email", settings.email],
    ["whatsapp", "WhatsApp (234…)", settings.whatsapp],
    ["facebookUrl", "Facebook URL", settings.facebookUrl],
    ["instagramUrl", "Instagram URL", settings.instagramUrl],
    ["tiktokUrl", "TikTok URL", settings.tiktokUrl],
    ["bannerLeft", "Top bar left", settings.bannerLeft],
    ["bannerCenter", "Top bar center", settings.bannerCenter],
    ["bannerRight", "Top bar right", settings.bannerRight],
    ["heroTitle", "Hero title", settings.heroTitle],
    ["heroSubtitle", "Hero subtitle", settings.heroSubtitle],
    ["heroCtaLabel", "Hero button label", settings.heroCtaLabel],
    ["heroCtaHref", "Hero button link", settings.heroCtaHref],
  ];

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      {fields.map(([name, label, value]) => (
        <div key={name}>
          <label className="label" htmlFor={name}>
            {label}
          </label>
          {name.includes("Subtitle") ? (
            <textarea id={name} name={name} className="input min-h-20" defaultValue={value} />
          ) : (
            <input id={name} name={name} className="input" defaultValue={value} required />
          )}
        </div>
      ))}
      <ImageUpload
        value={heroImageUrl}
        onChange={(url) => setHeroImageUrl(url || "/images/hero.jpg")}
        folder="hero"
        label="Homepage photo"
      />
      <p className="-mt-2 text-[12px] text-muted">
        The current homepage photo stays until she uploads a new one. The new file is saved with the site settings.
      </p>
      {msg && <p className="text-sm text-magenta">{msg}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
