import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err, toUserBookItem } from '@/lib/server-utils'
import type { ReadingStatus } from '@/generated/prisma/enums'

export const POST = async (request: Request) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return err('Invalid payload', 400)

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return err('Title is required', 400)

  const author = typeof body.author === 'string' ? body.author.trim() || null : null
  const coverUrl = typeof body.coverUrl === 'string' ? body.coverUrl.trim() || null : null
  const status = (typeof body.status === 'string' ? body.status : 'PLAN_TO_READ') as ReadingStatus
  const bookmarkSlot = typeof body.bookmarkSlot === 'number' ? body.bookmarkSlot : null

  let book = await prisma.book.findFirst({
    where: { title: { equals: title, mode: 'insensitive' }, author },
  })

  if (!book) {
    book = await prisma.book.create({ data: { title, author, coverUrl } })
  }

  const existing = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId, bookId: book.id } },
  })
  if (existing) return err('Book already in your collection', 409)

  const userBook = await prisma.userBook.create({
    data: { userId, bookId: book.id, status, bookmarkSlot },
    select: {
      id: true, status: true, bookmarkSlot: true, rating: true, notes: true, favorite: true, updatedAt: true,
      book: { select: { id: true, title: true, author: true, coverUrl: true } },
    },
  })

  return ok(toUserBookItem(userBook), 201)
}
