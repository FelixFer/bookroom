'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { deleteJson } from '@/lib/api'
import type { UserBookItem } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { BOOKMARK_KEYS, COLORS } from '@/app/_components/room/panels/BookmarkPanel'

type Props = {
  book: UserBookItem;
  onEdit: (book: UserBookItem) => void;
  onDeleted: (id: string) => void;
};

export const KanbanCard = ({ book, onEdit, onDeleted }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: book.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  }

  const bookmarkColor = book.bookmarkSlot != null
    ? COLORS[BOOKMARK_KEYS[book.bookmarkSlot]]
    : undefined;

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${book.title}" from your collection?`)) return
    await deleteJson(`/api/books/${book.id}`)
    onDeleted(book.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--kanban-card-bg)',
        borderColor: 'var(--kanban-border)',
        borderLeft: bookmarkColor ? `3px solid ${bookmarkColor}` : undefined,
        boxShadow: '2px 2px 0 var(--kanban-shadow)',
      }}
      className="group relative flex gap-2 border p-2.5"
    >

      {book.bookmarkSlot &&
        <div
          className='bookmark-card-book'
          style={{ backgroundColor: COLORS[BOOKMARK_KEYS[book.bookmarkSlot]] }}
        />
      }

      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        suppressHydrationWarning
        className="flex cursor-grab items-start pt-0.5 active:cursor-grabbing"
        style={{ color: 'var(--kanban-muted)' }}
        aria-label="Drag"
      >
        ⠿
      </div>

      {/* Cover */}
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-16 w-11 shrink-0 object-cover"
        />
      ) : (
        <div
          className="flex h-16 w-11 shrink-0 items-center justify-center text-xl"
          style={{ backgroundColor: 'var(--kanban-card-placeholder)' }}
        >
          📖
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="line-clamp-2 text-sm font-medium leading-tight"
          style={{ color: 'var(--kanban-text)' }}
        >
          {book.title}
        </p>
        {book.author && (
          <p
            className="mt-0.5 truncate text-xs"
            style={{ color: 'var(--kanban-muted)' }}
          >
            {book.author}
          </p>
        )}
        {book.rating && (
          <p className="mt-1 text-xs text-amber-500">
            {'★'.repeat(book.rating)}
            {'☆'.repeat(5 - book.rating)}
          </p>
        )}
        {book.favorite && (
          <span className="mt-0.5 inline-block text-xs">⭐</span>
        )}
      </div>

      {/* Actions — shown on hover */}
      <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="icon" size="sm" onClick={() => onEdit(book)} aria-label="Edit">✏</Button>
        <Button variant="icon-danger" size="sm" onClick={handleDelete} aria-label="Delete">✕</Button>
      </div>
    </div>
  )
}

export const KanbanCardOverlay = ({ book }: { book: UserBookItem }) => {
  const bookmarkColor = book.bookmarkSlot != null
    ? COLORS[BOOKMARK_KEYS[book.bookmarkSlot]]
    : undefined;
  return (
  <div
    className="flex w-64 gap-2 border p-2.5"
    style={{
      backgroundColor: 'var(--kanban-card-bg)',
      borderColor: 'var(--kanban-amber)',
      borderLeft: bookmarkColor ? `3px solid ${bookmarkColor}` : undefined,
      outline: '2px solid var(--kanban-amber)',
      boxShadow: '3px 3px 0 var(--kanban-rod)',
    }}
  >
    {book.bookmarkSlot &&
      <div
        className='bookmark-card-book'
        style={{ backgroundColor: COLORS[BOOKMARK_KEYS[book.bookmarkSlot]] }}
      />
    }
    <div className="flex cursor-grabbing items-start pt-0.5" style={{ color: 'var(--kanban-muted)' }}>⠿</div>
    {book.coverUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={book.coverUrl} alt={book.title} className="h-16 w-11 shrink-0 object-cover" />
    ) : (
      <div
        className="flex h-16 w-11 shrink-0 items-center justify-center text-xl"
        style={{ backgroundColor: 'var(--kanban-card-placeholder)' }}
      >
        📖
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 text-sm font-medium leading-tight" style={{ color: 'var(--kanban-text)' }}>
        {book.title}
      </p>
      {book.author && (
        <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--kanban-muted)' }}>
          {book.author}
        </p>
      )}
      {book.rating && (
        <p className="mt-1 text-xs text-amber-500">
          {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
        </p>
      )}
    </div>
  </div>
  );
}
