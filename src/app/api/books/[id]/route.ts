import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { ReadingStatus } from "@/generated/prisma/enums";
import type { UserBookItem } from "@/types/book";

type Params = { params: Promise<{ id: string }> };

export const PATCH = async (request: Request, { params }: Params) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const userBook = await prisma.userBook.findUnique({ where: { id } });
  if (!userBook)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (userBook.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const data: Record<string, unknown> = {};
  if ("status" in body) data.status = body.status as ReadingStatus;
  if ("rating" in body) data.rating = body.rating as number | null;
  if ("notes" in body) data.notes = body.notes as string | null;
  if ("favorite" in body) data.favorite = body.favorite as boolean;

  const updated = await prisma.userBook.update({
    where: { id },
    data,
    select: {
      id: true,
      status: true,
      rating: true,
      notes: true,
      favorite: true,
      updatedAt: true,
      book: { select: { id: true, title: true, author: true, coverUrl: true } },
    },
  });

  const result: UserBookItem = {
    id: updated.id,
    bookId: updated.book.id,
    title: updated.book.title,
    author: updated.book.author,
    coverUrl: updated.book.coverUrl,
    status: updated.status,
    rating: updated.rating,
    notes: updated.notes,
    favorite: updated.favorite,
    updatedAt: updated.updatedAt.toISOString(),
  };

  return NextResponse.json(result);
};

export const DELETE = async (_request: Request, { params }: Params) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const userBook = await prisma.userBook.findUnique({ where: { id } });
  if (!userBook)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (userBook.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const bookId = userBook.bookId;
  await prisma.userBook.delete({ where: { id } });

  // Clean up orphaned book
  const remaining = await prisma.userBook.count({ where: { bookId } });
  if (remaining === 0) await prisma.book.delete({ where: { id: bookId } });

  return NextResponse.json({ success: true });
};
