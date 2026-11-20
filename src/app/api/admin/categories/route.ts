import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = schema.parse(await req.json());
    const base = slugify(body.name) || "section";
    let slug = base;
    let n = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    const parentId = body.parentId || null;
    if (parentId && !(await prisma.category.findUnique({ where: { id: parentId } }))) {
      return NextResponse.json({ error: "Parent section not found" }, { status: 400 });
    }
    const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true }, where: { parentId } });
    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        slug,
        description: body.description || null,
        sortOrder: body.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
        parentId,
        imageUrl: body.imageUrl || null,
      },
    });
    return NextResponse.json(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
