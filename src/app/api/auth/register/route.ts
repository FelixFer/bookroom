import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = "email" in body ? body.email : undefined;
  const password = "password" in body ? body.password : undefined;
  const name = "name" in body ? body.name : undefined;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const passwordHash = hashPassword(password);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: typeof name === "string" ? name : null,
        passwordHash,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    console.error(e);

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

    if (
      e instanceof Prisma.PrismaClientInitializationError ||
      e instanceof Prisma.PrismaClientRustPanicError ||
      e instanceof Prisma.PrismaClientUnknownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "production"
              ? "Failed to create account"
              : `${e.name}: ${e.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Failed to create account"
            : `Unknown error: ${String(e)}`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
};
