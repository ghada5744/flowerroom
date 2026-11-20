import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

/** True if `candidateId` is `id` itself or one of its sub-sections (would make a loop) */
async function isSelfOrDescendant(id: string, candidateId: string) {
  let cur: string | null = candidateId;
  while (cur) {
    if (cur === id) return true;
    const row: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: cur },
      select: { parentId: true },
    });
    cur = row?.parentId ?? null;
  }
  return false;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const body = schema.parse(await req.json());
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let parentId = existing.parentId;
    if (body.parentId !== undefined) {
      parentId = body.parentId || null;
      if (parentId && (await isSelfOrDescendant(id, parentId))) {
        return NextResponse.json(
          { error: "A section can't be placed inside itself or one of its own sub-sections." },
          { status: 400 },
        );
      }
    }

    const name = body.name?.trim() || existing.name;
    let slug = existing.slug;
    if (name !== existing.name) {
      const base = slugify(name) || "section";
      slug = base;
      let n = 1;
      while (true) {
        const clash = await prisma.category.findUnique({ where: { slug } });
        if (!clash || clash.id === id) break;
        slug = `${base}-${n++}`;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: body.description ?? existing.description,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        parentId,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl || null : existing.imageUrl,
      },
    });
    return NextResponse.json(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const subCount = await prisma.category.count({ where: { parentId: id } });
  if (subCount > 0) {
    return NextResponse.json(
      { error: `This section has ${subCount} sub-section(s). Move or delete them first.` },
      { status: 400 },
    );
  }
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `This section still has ${count} product(s). Move or delete them first.` },
      { status: 400 },
    );
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
