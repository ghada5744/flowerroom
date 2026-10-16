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

type Ctx = { params: Promise<{ id: string }> };

async function uniqueProductSlug(name: string, excludeId: string) {
  const base = slugify(name) || "product";
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;

  try {
    const body = schema.parse(await req.json());
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const slug = body.slug?.trim()
      ? await uniqueProductSlug(body.slug, id)
      : body.name !== existing.name
        ? await uniqueProductSlug(body.name, id)
        : existing.slug;

    const urls = (body.images?.length ? body.images : body.imageUrl ? [body.imageUrl] : []).filter(Boolean);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: body.name,
          slug,
          description: body.description,
          imageUrl: urls[0] || null,
          badge: body.badge || null,
          categoryId: body.categoryId,
          active: body.active,
          featured: body.featured ?? false,
          ...(body.videoNote !== undefined ? { videoNote: body.videoNote } : {}),
          ...(body.specs !== undefined ? { specs: body.specs || null } : {}),
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (urls.length) {
        await tx.productImage.createMany({
          data: urls.map((url, i) => ({ productId: id, url, sortOrder: i })),
        });
      }

      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({
        data: body.variants.map((v) => ({
          productId: id,
          name: v.name,
          priceKobo: v.priceKobo,
          color: v.color || null,
          sortOrder: v.sortOrder,
        })),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
