'use client'

import { useEffect, useState } from 'react'
import { getJson } from '@/lib/api'
import { BOOKMARK_KEYS, COLORS } from '@/app/_components/room/panels/BookmarkPanel'

type Book = {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  bookmarkSlot: number | null;
};

export const TrashPanel = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBooks = () => {
    getJson<{ books: Book[] }>('/api/room/books?status=DROPPED')
      .then((data) => setBooks(data.books))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBooks()
    window.addEventListener('bookmarks-updated', fetchBooks)
    return () => window.removeEventListener('bookmarks-updated', fetchBooks)
  }, [])

  if (loading) return <p className="form-help">Loading…</p>
  if (!books.length)
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <span className="text-4xl">🗑️</span>
        <p className="form-help">Nothing here. Every book deserves a chance!</p>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <p className="form-help text-xs">Books you started but didn&apos;t finish.</p>
      {books.map((b) => {
        const bookmarkColor = b.bookmarkSlot != null
          ? COLORS[BOOKMARK_KEYS[b.bookmarkSlot - 1]]
          : undefined
        return (
        <div
          key={b.id}
          className="panel-card--shelf relative flex gap-3 opacity-70"
          style={bookmarkColor ? { borderLeftColor: bookmarkColor, borderLeftWidth: '3px' } : undefined}
        >
          {b.bookmarkSlot && (
            <div className="bookmark-card-book" style={{ backgroundColor: bookmarkColor, left: '24px' }} />
          )}
          {b.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.coverUrl}
              alt={b.title}
              className="h-16 w-10 shrink-0 rounded object-cover shadow grayscale"
            />
          )}
          <div className="flex flex-col justify-center gap-1">
            <p className="font-medium text-zinc-700 line-through dark:text-zinc-400">
              {b.title}
            </p>
            {b.author && (
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
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
