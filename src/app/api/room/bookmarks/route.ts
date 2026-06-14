import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/server-utils'
import { MAX_BOOKMARK_LABEL_LENGTH, BOOKMARK_LABEL_TOO_LONG } from '@/lib/bookmarks'

export const GET = async (request: Request) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const labeledOnly = new URL(request.url).searchParams.get('labeled') === 'true'

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, ...(labeledOnly && { label: { not: null } }) },
    select: { slot: true, label: true },
    orderBy: { slot: 'asc' },
  })

  return ok({ data: bookmarks })
}

export const PUT = async (request: Request) => {
  const userId = await requireAuth()
  if (!userId) return err('Unauthorized', 401)

  const body = (await request.json().catch(() => null)) as unknown
  if (!Array.isArray(body)) return err('Invalid payload', 422)

  const entries = body as { slot: number; label: string | null }[]

  for (const { label } of entries) {
    if (typeof label === 'string' && label.trim().length > MAX_BOOKMARK_LABEL_LENGTH) {
      return err(BOOKMARK_LABEL_TOO_LONG, 422)
    }
  }

  try {
    await Promise.all(
      entries.map(({ slot, label }) => {
        const normalized = label?.trim() || null
        const ops: Promise<unknown>[] = [
          prisma.bookmark.upsert({
            where: { userId_slot: { userId, slot } },
            create: { userId, slot, label: normalized },
            update: { label: normalized },
          }),
        ]
        if (!normalized) {
          ops.push(
            prisma.userBook.updateMany({
              where: { userId, bookmarkSlot: slot },
              data: { bookmarkSlot: null },
            }),
          )
        }
        return Promise.all(ops)
      }),
    )
    return ok({ message: 'Changes Saved' }, 201)
  } catch (e) {
    console.error(e)
    return err('Failed to save bookmarks', 500)
  }
}
