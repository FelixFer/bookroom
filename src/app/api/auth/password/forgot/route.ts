import { prisma } from "@/lib/prisma";
import { generateResetToken, hashResetToken } from "@/lib/password-reset";
import { ok, err } from "@/lib/server-utils";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return err("Invalid payload", 422);

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return err("Email is required", 422);

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return err("Email not found", 404);

  const expiresAt = new Date(Date.now() + 3600000);

  for (let i = 0; i < 3; i++) {
    const token = generateResetToken();
    const tokenHash = hashResetToken(token);
    try {
      await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
      const response: { ok: true; resetUrl?: string } = { ok: true };
      if (process.env.NODE_ENV !== "production") {
        response.resetUrl = `${request.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`;
      }
      return ok(response);
    } catch {
      continue;
    }
  }

  return err("Something went wrong", 400);
};
