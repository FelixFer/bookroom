import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateResetToken, hashResetToken } from "@/lib/password-reset";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: true });
  }

  const email = "email" in body ? body.email : undefined;
  if (typeof email !== "string") {
    return NextResponse.json({ ok: true });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ ok: true });
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
      return NextResponse.json({ ok: true });
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const response: { ok: true; resetUrl?: string } = { ok: true };
  if (process.env.NODE_ENV !== "production") response.resetUrl = resetUrl;
  return NextResponse.json(response);
};
