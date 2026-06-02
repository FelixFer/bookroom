import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [
    totalBooks,
    completedCount,
    completedThisYear,
    currentlyReading,
    favoriteCount,
    droppedCount,
    doneBooks,
  ] = await Promise.all([
    prisma.userBook.count({ where: { userId } }),
    prisma.userBook.count({ where: { userId, status: "COMPLETED" } }),
    prisma.userBook.count({
      where: { userId, status: "COMPLETED", updatedAt: { gte: yearStart } },
    }),
    prisma.userBook.count({ where: { userId, status: "READING" } }),
    prisma.userBook.count({ where: { userId, favorite: true } }),
    prisma.userBook.count({ where: { userId, status: "DROPPED" } }),
    prisma.userBook.findMany({
      where: { userId, status: "COMPLETED" },
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // Compute reading streak from completed-book dates
  const doneDays = new Set(
    doneBooks.map((b) => b.updatedAt.toISOString().slice(0, 10)),
  );
  const sortedDays = [...doneDays].sort().reverse();

  let currentStreak = 0;
  let streak = 0;

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    const prev = sortedDays[i - 1];

    if (i === 0) {
      const today = new Date().toISOString().slice(0, 10);
      const diffMs =
        new Date(today).getTime() - new Date(day).getTime();
      const diffDays = Math.round(diffMs / 86_400_000);
      if (diffDays > 1) break;
      streak = 1;
    } else {
      const diff = Math.round(
        (new Date(prev).getTime() - new Date(day).getTime()) / 86_400_000,
      );
      if (diff === 1) streak++;
      else break;
    }
    currentStreak = streak;
  }

  // Longest streak across full history
  let maxStreak = 0;
  let run = 0;
  const allSorted = [...doneDays].sort();
  for (let i = 0; i < allSorted.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const diff = Math.round(
        (new Date(allSorted[i]).getTime() - new Date(allSorted[i - 1]).getTime()) /
          86_400_000,
      );
      run = diff === 1 ? run + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, run);
  }

  const recentDates = sortedDays.slice(0, 7).reverse();

  return NextResponse.json({
    totalBooks,
    doneCount: completedCount,
    doneThisYear: completedThisYear,
    currentlyReading,
    favoriteCount,
    dnfCount: droppedCount,
    currentStreak,
    longestStreak: maxStreak,
    totalDone: completedCount,
    recentDates,
  });
};
