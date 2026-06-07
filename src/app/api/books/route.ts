import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { ReadingStatus } from "@/generated/prisma/enums";
import type { UserBookItem } from "@/types/book";

export const POST = async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const title =
    "title" in body && typeof body.title === "string" ? body.title.trim() : "";
  if (!title)
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const author =
    "author" in body && typeof body.author === "string"
      ? body.author.trim() || null
      : null;

  const coverUrl =
    "coverUrl" in body && typeof body.coverUrl === "string"
      ? body.coverUrl.trim() || null
      : null;

  const status =
    "status" in body && typeof body.status === "string"
      ? (body.status as ReadingStatus)
      : "PLAN_TO_READ";

  const bookmarkSlot =
    "bookmarkSlot" in body && typeof body.bookmarkSlot === "number"
      ? body.bookmarkSlot
      : null;

  // Find existing book or create a new one
  let book = await prisma.book.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      author: author ?? null,
    },
  });

  if (!book) {
    book = await prisma.book.create({ data: { title, author, coverUrl } });
  }

  // Check if user already has this book
  const existing = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId: session.user.id, bookId: book.id } },
  });
  if (existing)
    return NextResponse.json(
      { error: "Book already in your collection" },
      { status: 409 },
    );

  const userBook = await prisma.userBook.create({
    data: { userId: session.user.id, bookId: book.id, status, bookmarkSlot },
    select: {
      id: true,
      status: true,
      bookmarkSlot: true,
      rating: true,
      notes: true,
      favorite: true,
      updatedAt: true,
      book: { select: { id: true, title: true, author: true, coverUrl: true } },
    },
  });

  const result: UserBookItem = {
    id: userBook.id,
    bookId: userBook.book.id,
    title: userBook.book.title,
    author: userBook.book.author,
    coverUrl: userBook.book.coverUrl,
    status: userBook.status,
    bookmarkSlot: userBook.bookmarkSlot,
    rating: userBook.rating,
    notes: userBook.notes,
    favorite: userBook.favorite,
    updatedAt: userBook.updatedAt.toISOString(),
  };

  return NextResponse.json(result, { status: 201 });
};
