'use client'

import { useEffect, useState } from 'react'
import { getJson } from '@/lib/api'

type Book = {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  rating: number | null;
  notes: string | null;
};

export const CouchPanel = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson<{ books: Book[] }>('/api/room/books?status=READING')
      .then((data) => setBooks(data.books))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="form-help">Loading…</p>
  if (!books.length)
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <span className="text-4xl">🛋️</span>
        <p className="form-help">No books in progress. Time to start one!</p>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      {books.map((b) => (
        <div
          key={b.id}
          className="flex gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
        >
          {b.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.coverUrl}
              alt={b.title}
              className="h-20 w-14 shrink-0 rounded object-cover shadow"
            />
          )}
          <div className="flex flex-col gap-1 overflow-hidden">
            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {b.title}
            </p>
            {b.author && (
              <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                {b.author}
              </p>
            )}
            {b.notes && (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-600">
                {b.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
