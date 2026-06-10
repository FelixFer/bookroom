import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err, parseBody, toUserBookItem, userBookSelect } from '@/lib/server-utils'
import { DEFAULT_STATUS } from '@/types/book'
import type { ReadingStatus } from '@/generated/prisma/enums'

export const POST = async (request: Request) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const { body, response } = await parseBody(request)
  if (!body) return response

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return err('Title is required', 400)

  const author = typeof body.author === 'string' ? body.author.trim() || null : null
  const coverUrl = typeof body.coverUrl === 'string' ? body.coverUrl.trim() || null : null
  const status = (typeof body.status === 'string' ? body.status : DEFAULT_STATUS) as ReadingStatus
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
    select: userBookSelect,
  })

  return ok(toUserBookItem(userBook), 201)
}
