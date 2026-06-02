import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userBooks = await prisma.userBook.findMany({
    where: {
      userId: session.user.id,
      notes: { not: null },
    },
    select: {
      updatedAt: true,
      notes: true,
      book: {
        select: { id: true, title: true, author: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const books = userBooks.map((ub) => ({
    id: ub.book.id,
    title: ub.book.title,
    author: ub.book.author,
    notes: ub.notes!,
    updatedAt: ub.updatedAt.toISOString(),
  }));

  return NextResponse.json({ books });
};
