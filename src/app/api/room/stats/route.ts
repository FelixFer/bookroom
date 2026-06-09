import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/server-utils'

function computeStreaks(doneBooks: { updatedAt: Date }[]) {
  const days = [...new Set(doneBooks.map((b) => b.updatedAt.toISOString().slice(0, 10)))].sort()
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0, recentDates: [] as string[] }

  const today = new Date().toISOString().slice(0, 10)
  let currentStreak = 0
  if (Math.round((new Date(today).getTime() - new Date(days[days.length - 1]).getTime()) / 86400000) <= 1) {
    currentStreak = 1
    for (let i = days.length - 2; i >= 0; i--) {
      if (Math.round((new Date(days[i + 1]).getTime() - new Date(days[i]).getTime()) / 86400000) === 1) currentStreak++
      else break
    }
  }

  let longestStreak = 0, run = 0
  for (let i = 0; i < days.length; i++) {
    if (i === 0 || Math.round((new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86400000) === 1) run++
    else run = 1
    longestStreak = Math.max(longestStreak, run)
  }

  return { currentStreak, longestStreak, recentDates: days.slice(-7).reverse() }
}

export const GET = async () => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const yearStart = new Date(new Date().getFullYear(), 0, 1)

  const [totalBooks, completedCount, completedThisYear, currentlyReading, favoriteCount, droppedCount, doneBooks] =
    await Promise.all([
      prisma.userBook.count({ where: { userId } }),
      prisma.userBook.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.userBook.count({ where: { userId, status: 'COMPLETED', updatedAt: { gte: yearStart } } }),
      prisma.userBook.count({ where: { userId, status: 'READING' } }),
      prisma.userBook.count({ where: { userId, favorite: true } }),
      prisma.userBook.count({ where: { userId, status: 'DROPPED' } }),
      prisma.userBook.findMany({ where: { userId, status: 'COMPLETED' }, select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
    ])

  const { currentStreak, longestStreak, recentDates } = computeStreaks(doneBooks)

  return ok({
    totalBooks, doneCount: completedCount, doneThisYear: completedThisYear,
    currentlyReading, favoriteCount, dnfCount: droppedCount,
    currentStreak, longestStreak, totalDone: completedCount, recentDates,
  })
}
