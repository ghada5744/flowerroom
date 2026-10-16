import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  priceKobo: z.number().int().min(0),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  images: z.array(z.string().min(1)).optional(),
  badge: z.string().nullable().optional(),
  categoryId: z.string().min(1),
  active: z.boolean(),
  featured: z.boolean().optional().default(false),
  videoNote: z.string().optional(),
  specs: z.string().nullable().optional(),
  variants: z.array(variantSchema).min(1),
});

async function uniqueProductSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "product";
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = schema.parse(await req.json());
    const slug = body.slug?.trim() ? slugify(body.slug) : await uniqueProductSlug(body.name);
    const urls = (body.images?.length ? body.images : body.imageUrl ? [body.imageUrl] : []).filter(Boolean);
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        imageUrl: urls[0] || null,
        images: {
          create: urls.map((url, i) => ({ url, sortOrder: i })),
        },
        badge: body.badge || null,
        categoryId: body.categoryId,
        active: body.active,
        featured: body.featured ?? false,
        videoNote:
          body.videoNote ||
          "Once arranged, your florist will send a video via WhatsApp or email for your approval before delivery.",
        specs: body.specs || null,
        variants: {
          create: body.variants.map((v) => ({
            name: v.name,
            priceKobo: v.priceKobo,
            color: v.color || null,
            sortOrder: v.sortOrder,
          })),
        },
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
