import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, verifyPassword } from "@/lib/customer-auth";
import { apiErrorFromUnknown } from "@/lib/form-errors";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createCustomerSession({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    const { status, body } = apiErrorFromUnknown(err, "Login failed. Please try again.");
    return NextResponse.json(body, { status });
  }
}
