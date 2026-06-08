import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/server-utils";

export const GET = async () => {
  const userId = await requireAuth();
  if (!userId) return err("Unauthorized", 401);

  const userBooks = await prisma.userBook.findMany({
    where: { userId, notes: { not: null } },
    select: {
      updatedAt: true, notes: true,
      book: { select: { id: true, title: true, author: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const books = userBooks.map((ub) => ({
    id: ub.book.id, title: ub.book.title, author: ub.book.author,
    notes: ub.notes!, updatedAt: ub.updatedAt.toISOString(),
  }));

  return ok({ books });
};
