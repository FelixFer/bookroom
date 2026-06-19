'use client'

import { useGet } from '@/hooks/useGet'
import { EmptyState } from '@/app/_components/EmptyState'
import { LoaderOverlay } from '@/app/_components/Loader'

type NoteBook = {
  id: string;
  title: string;
  author: string | null;
  notes: string;
  updatedAt: string;
};

export const NotebookPanel = () => {
  const { data: books, loading } = useGet<{ books: NoteBook[] }, NoteBook[]>(
    '/api/room/notes',
    (res) => res.books,
    'books-updated'
  )

  if (loading) return <LoaderOverlay />
  if (!books?.length)
    return (
      <EmptyState emoji="📋">
        No notes yet. Add your thoughts to books in your collection!
      </EmptyState>
    )

  return (
    <div className="flex flex-col gap-4">
      {books.map((b) => (
        <div
          key={b.id}
          className="panel-card--shelf"
        >
          <p className="font-semibold text-room-text">
            {b.title}
          </p>
          {b.author && (
            <p className="text-xs text-room-muted">
              {b.author}
            </p>
          )}
          <p className="mt-2 text-sm text-room-muted italic">
            &ldquo;{b.notes}&rdquo;
          </p>
          <p className="mt-2 text-xs text-room-muted">
            {new Date(b.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}
