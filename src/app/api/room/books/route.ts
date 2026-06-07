import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { ReadingStatus } from "@/generated/prisma/enums";

export const GET = async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") as ReadingStatus | null;

  const userBooks = await prisma.userBook.findMany({
    where: {
      userId: session.user.id,
      ...(statusParam ? { status: statusParam } : {}),
    },
    select: {
      id: true,
      status: true,
      bookmarkSlot: true,
      rating: true,
      notes: true,
      favorite: true,
      updatedAt: true,
      book: {
        select: { id: true, title: true, author: true, coverUrl: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const books = userBooks.map((ub) => ({
    id: ub.id,
    bookId: ub.book.id,
    title: ub.book.title,
    author: ub.book.author,
    coverUrl: ub.book.coverUrl,
    status: ub.status,
    bookmarkSlot: ub.bookmarkSlot,
    rating: ub.rating,
    notes: ub.notes,
    favorite: ub.favorite,
    updatedAt: ub.updatedAt,
  }));

  return NextResponse.json({ books });
};
