import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err, toUserBookItem, userBookSelect } from '@/lib/server-utils'
import type { ReadingStatus } from '@/generated/prisma/enums'

export const GET = async (request: Request) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get('status') as ReadingStatus | null

  const userBooks = await prisma.userBook.findMany({
    where: { userId, ...(statusParam ? { status: statusParam } : {}) },
    select: userBookSelect,
    orderBy: { updatedAt: 'desc' },
  })

  return ok({ books: userBooks.map(toUserBookItem) })
}
