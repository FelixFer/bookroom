import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateResetToken, hashResetToken } from "@/lib/password-reset";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = (await request.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const email = "email" in body ? body.email : undefined;
  if (typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 422 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  let token = "";
  for (let i = 0; i < 3; i++) {
    token = generateResetToken();
    const tokenHash = hashResetToken(token);
    try {
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
      break;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue;
      }
      return NextResponse.json({ error: "Somehing went wrong" }, { status: 400 });
    }
  }

  const baseUrl = request.nextUrl.origin;
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const response: { ok: true; resetUrl?: string } = { ok: true };
  if (process.env.NODE_ENV !== "production") response.resetUrl = resetUrl;
  return NextResponse.json(response);
};
