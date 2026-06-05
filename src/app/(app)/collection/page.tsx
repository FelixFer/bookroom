import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./KanbanBoard";
import type { UserBookItem } from "@/types/book";

export const metadata = { title: "My Collection — Bookroom" };

export default async function CollectionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const userBooks = await prisma.userBook.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
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

  const books: UserBookItem[] = userBooks.map((ub) => ({
    id: ub.id,
    bookId: ub.book.id,
    title: ub.book.title,
    author: ub.book.author,
    coverUrl: ub.book.coverUrl,
    status: ub.status,
    rating: ub.rating,
    notes: ub.notes,
    favorite: ub.favorite,
    updatedAt: ub.updatedAt.toISOString(),
  }));

  return <KanbanBoard initialBooks={books} />;
}
