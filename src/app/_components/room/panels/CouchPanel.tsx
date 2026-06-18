'use client'

import { getBookmarkColor } from '@/lib/bookmarks'
import { useGet } from '@/hooks/useGet'
import { EmptyState } from '@/app/_components/EmptyState'
import { BookCover } from '@/app/_components/BookCover'
import type { UserBookItem } from '@/types/book'
import { LoaderOverlay } from '@/app/_components/Loader'

type Book = Pick<UserBookItem, 'id' | 'title' | 'author' | 'coverUrl' | 'rating' | 'notes' | 'bookmarkSlot'>;

export const CouchPanel = () => {
  const { data: books, loading } = useGet<{ books: Book[] }, Book[]>(
    '/api/room/books?status=READING',
    (res) => res.books,
    'bookmarks-updated',
  )

  if (loading) return <LoaderOverlay />
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
              placeholderClassName="h-20 w-14 rounded bg-room-bg text-2xl"
            />
            <div className="flex flex-col gap-1 overflow-hidden">
              <p className="truncate font-semibold text-room-text">
                {b.title}
              </p>
              <p className="truncate text-sm text-room-muted">
                {b.author ?? '—'}
              </p>
              {b.notes && (
                <p className="mt-1 line-clamp-2 text-xs text-room-muted">
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
