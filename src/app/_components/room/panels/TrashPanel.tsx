'use client'

import { getBookmarkColor } from '@/lib/bookmarks'
import { useGet } from '@/hooks/useGet'
import { EmptyState } from '@/app/_components/EmptyState'
import { BookCover } from '@/app/_components/BookCover'
import type { UserBookItem } from '@/types/book'

type Book = Pick<UserBookItem, 'id' | 'title' | 'author' | 'coverUrl' | 'bookmarkSlot'>;

export const TrashPanel = () => {
  const { data: books, loading } = useGet<{ books: Book[] }, Book[]>(
    '/api/room/books?status=DROPPED',
    (res) => res.books,
    'bookmarks-updated',
  )

  if (loading) return <p className="form-help">Loading…</p>
  if (!books?.length)
    return <EmptyState emoji="🗑️">Nothing here. Every book deserves a chance!</EmptyState>

  return (
    <div className="flex flex-col gap-4">
      <p className="form-help text-xs">Books you started but didn&apos;t finish.</p>
      {books.map((b) => {
        const bookmarkColor = getBookmarkColor(b.bookmarkSlot)
        return (
        <div
          key={b.id}
          className="panel-card--shelf relative flex gap-3 opacity-70"
          style={bookmarkColor ? { borderLeftColor: bookmarkColor, borderLeftWidth: '3px' } : undefined}
        >
          {b.bookmarkSlot && (
            <div className="bookmark-card-book" style={{ backgroundColor: bookmarkColor, left: '24px' }} />
          )}
          <BookCover
            coverUrl={b.coverUrl}
            title={b.title}
            className="h-16 w-10 shrink-0 rounded object-cover shadow grayscale"
          />
          <div className="flex flex-col justify-center gap-1">
            <p className="font-medium text-room-muted line-through">
              {b.title}
            </p>
            {b.author && (
              <p className="text-xs text-room-muted">
                {b.author}
              </p>
            )}
          </div>
        </div>
        )
      })}
    </div>
  )
}
