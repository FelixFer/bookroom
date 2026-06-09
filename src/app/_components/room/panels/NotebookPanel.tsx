'use client'

import { useEffect, useState } from 'react'
import { getJson } from '@/lib/api'

type NoteBook = {
  id: string;
  title: string;
  author: string | null;
  notes: string;
  updatedAt: string;
};

export const NotebookPanel = () => {
  const [books, setBooks] = useState<NoteBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson<{ books: NoteBook[] }>('/api/room/notes')
      .then((data) => setBooks(data.books))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="form-help">Loading notes…</p>
  if (!books.length)
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <span className="text-4xl">📋</span>
        <p className="form-help">
          No notes yet. Add your thoughts to books in your collection!
        </p>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      {books.map((b) => (
        <div
          key={b.id}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {b.title}
          </p>
          {b.author && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              {b.author}
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 italic">
            &ldquo;{b.notes}&rdquo;
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
            {new Date(b.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}
