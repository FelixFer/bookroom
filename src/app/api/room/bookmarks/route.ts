import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    select: { slot: true, label: true },
    orderBy: { slot: "asc" },
  });

  return NextResponse.json({ data: bookmarks }, { status: 200 });
};

export const PUT = async (request: Request) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user.id;
  const body = (await request.json().catch(() => null)) as unknown;

  if (!Array.isArray(body))
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 })

  await Promise.all(
    body.map(({ slot, label }: { slot: number; label: string | null }) =>
      // upsert is used to update existing entry or create a new one if not exist yet
      prisma.bookmark.upsert({
        where: { userId_slot: { userId: user, slot } },
        create: { userId: user, slot, label: label || null },
        update: { label: label || null },
      })
    )
  );

  return NextResponse.json({ message: "Changes Saved" }, { status: 201 })
};