import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = z
    .object({
      published: z.boolean().optional(),
      authorName: z.string().optional(),
      title: z.string().optional(),
      body: z.string().optional(),
      rating: z.number().int().min(1).max(5).optional(),
      sourceUrl: z.string().url().optional().nullable(),
      sortOrder: z.number().int().optional(),
    })
    .parse(await req.json());

  const review = await prisma.review.update({ where: { id }, data: body });
  return NextResponse.json(review);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
