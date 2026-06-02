import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const count = await prisma.userBook.count({ where: { userId } });
  if (count === 0) return NextResponse.json({ book: null });

  const skip = Math.floor(Math.random() * count);

  const userBook = await prisma.userBook.findFirst({
    where: { userId },
    skip,
    select: {
      status: true,
      book: {
        select: { id: true, title: true, author: true, coverUrl: true },
      },
    },
  });

  if (!userBook) return NextResponse.json({ book: null });

  return NextResponse.json({
    book: {
      id: userBook.book.id,
      title: userBook.book.title,
      author: userBook.book.author,
      coverUrl: userBook.book.coverUrl,
      status: userBook.status,
    },
  });
};
