import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function requireAuth(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

export async function parseBody<T extends Record<string, unknown>>(
  request: Request,
): Promise<{ body: T; response: null } | { body: null; response: Response }> {
  const raw = (await request.json().catch(() => null)) as unknown
  if (!raw || typeof raw !== 'object') {
    return { body: null, response: err('Invalid payload', 400) }
  }
  return { body: raw as T, response: null }
}

export const userBookSelect = {
  id: true, status: true, bookmarkSlot: true, rating: true, notes: true, favorite: true, updatedAt: true,
  book: { select: { id: true, title: true, author: true, coverUrl: true } },
} as const

export async function findOwnedUserBook(id: string, userId: string) {
  const userBook = await prisma.userBook.findUnique({ where: { id } })
  if (!userBook) return { userBook: null, response: err('Not found', 404) } as const
  if (userBook.userId !== userId) return { userBook: null, response: err('Forbidden', 403) } as const
  return { userBook, response: null } as const
}

type UserBookWithBook = {
  id: string; status: string; bookmarkSlot: number | null; rating: number | null;
  notes: string | null; favorite: boolean; updatedAt: Date;
  book: { id: string; title: string; author: string | null; coverUrl: string | null };
};

export function toUserBookItem(ub: UserBookWithBook) {
  return {
    id: ub.id, bookId: ub.book.id, title: ub.book.title, author: ub.book.author,
    coverUrl: ub.book.coverUrl, status: ub.status, bookmarkSlot: ub.bookmarkSlot,
    rating: ub.rating, notes: ub.notes, favorite: ub.favorite,
    updatedAt: ub.updatedAt instanceof Date ? ub.updatedAt.toISOString() : ub.updatedAt,
  }
}
