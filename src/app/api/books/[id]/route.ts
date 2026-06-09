import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err, toUserBookItem } from '@/lib/server-utils'

type Params = { params: Promise<{ id: string }> };

export const PATCH = async (request: Request, { params }: Params) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const { id } = await params

  const userBook = await prisma.userBook.findUnique({ where: { id } })
  if (!userBook) return err('Not found', 404)
  if (userBook.userId !== userId) return err('Forbidden', 403)

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  const data: Record<string, unknown> = {}
  if ('status' in body) data.status = body.status
  if ('bookmarkSlot' in body) data.bookmarkSlot = body.bookmarkSlot
  if ('rating' in body) data.rating = body.rating
  if ('notes' in body) data.notes = body.notes
  if ('favorite' in body) data.favorite = body.favorite

  const updated = await prisma.userBook.update({
    where: { id },
    data,
    select: {
      id: true, status: true, bookmarkSlot: true, rating: true, notes: true, favorite: true, updatedAt: true,
      book: { select: { id: true, title: true, author: true, coverUrl: true } },
    },
  })

  return ok(toUserBookItem(updated))
}

export const DELETE = async (_request: Request, { params }: Params) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const { id } = await params

  const userBook = await prisma.userBook.findUnique({ where: { id } })
  if (!userBook) return err('Not found', 404)
  if (userBook.userId !== userId) return err('Forbidden', 403)

  const bookId = userBook.bookId
  await prisma.userBook.delete({ where: { id } })

  const remaining = await prisma.userBook.count({ where: { bookId } })
  if (remaining === 0) await prisma.book.delete({ where: { id: bookId } })

  return ok({ success: true })
}
