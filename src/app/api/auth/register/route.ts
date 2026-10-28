import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, hashPassword } from "@/lib/customer-auth";
import { apiErrorFromUnknown } from "@/lib/form-errors";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  marketingOptIn: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        passwordHash: await hashPassword(body.password),
        marketingOptIn: body.marketingOptIn ?? true,
      },
    });

    if (body.marketingOptIn) {
      await prisma.subscriber.upsert({
        where: { email },
        create: { email },
        update: {},
      });
    }

    await createCustomerSession({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    const { status, body } = apiErrorFromUnknown(err, "Registration failed. Please check the form.");
    return NextResponse.json(body, { status });
  }
}
