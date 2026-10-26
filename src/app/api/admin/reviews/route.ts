import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  authorName: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  sourceUrl: z.string().url().optional().nullable(),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = schema.parse(await req.json());
    const review = await prisma.review.create({ data: body });
    return NextResponse.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
