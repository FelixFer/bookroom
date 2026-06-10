'use client'

import { getBookmarkColor } from '@/lib/bookmarks'
import { useGet } from '@/hooks/useGet'
import { EmptyState } from '@/app/_components/EmptyState'
import { BookCover } from '@/app/_components/BookCover'
import type { UserBookItem } from '@/types/book'

type Book = Pick<UserBookItem, 'id' | 'title' | 'author' | 'coverUrl' | 'rating' | 'notes' | 'bookmarkSlot'>;

export const CouchPanel = () => {
  const { data: books, loading } = useGet<{ books: Book[] }, Book[]>(
    '/api/room/books?status=READING',
    (res) => res.books,
    'bookmarks-updated',
  )

  if (loading) return <p className="form-help">Loading…</p>
  if (!books?.length)
    return <EmptyState emoji="🛋️">No books in progress. Time to start one!</EmptyState>

  return (
    <div className="flex flex-col gap-4">
      {books.map((b) => {
        const bookmarkColor = getBookmarkColor(b.bookmarkSlot)
        return (
        <div
          key={b.id}
          className="panel-card--shelf relative flex gap-3"
          style={bookmarkColor ? { borderLeftColor: bookmarkColor, borderLeftWidth: '3px' } : undefined}
        >
          {b.bookmarkSlot && (
            <div className="bookmark-card-book" style={{ backgroundColor: bookmarkColor, left: '24px' }} />
          )}
          <BookCover
            coverUrl={b.coverUrl}
            title={b.title}
            className="h-20 w-14 shrink-0 rounded object-cover shadow"
            placeholderClassName="h-20 w-14 rounded bg-zinc-100 text-2xl dark:bg-zinc-800"
          />
          <div className="flex flex-col gap-1 overflow-hidden">
            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {b.title}
            </p>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {b.author ?? '—'}
            </p>
            {b.notes && (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-600">
                {b.notes}
              </p>
            )}
          </div>
        </div>
        )
      })}
    </div>
  )
}
