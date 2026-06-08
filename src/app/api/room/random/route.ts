import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/server-utils";

export const GET = async () => {
  const userId = await requireAuth();
  if (!userId) return err("Unauthorized", 401);

  const count = await prisma.userBook.count({ where: { userId } });
  if (count === 0) return ok({ book: null });

  const userBook = await prisma.userBook.findFirst({
    where: { userId },
    skip: Math.floor(Math.random() * count),
    select: {
      status: true,
      book: { select: { id: true, title: true, author: true, coverUrl: true } },
    },
  });

  return ok({ book: userBook ? { ...userBook.book, status: userBook.status } : null });
};
