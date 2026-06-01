import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashResetToken } from "@/lib/password-reset";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const token = "token" in body ? body.token : undefined;
  const password = "password" in body ? body.password : undefined;

  if (typeof token !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const tokenHash = hashResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 400 },
    );
  }

  const passwordHash = hashPassword(password);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return NextResponse.json(
        {
          error:
            "Database is not initialized (migrations not applied). Run npm run prisma:migrate",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
};

