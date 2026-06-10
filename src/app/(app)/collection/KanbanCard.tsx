'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { UserBookItem } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { BOOKMARK_KEYS, COLORS } from '@/app/_components/room/panels/BookmarkPanel'

type Props = {
  book: UserBookItem;
  onEdit: (book: UserBookItem) => void;
  onDelete: (book: UserBookItem) => void;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
};

export const KanbanCard = ({ book, onEdit, onDelete, selectionMode, selected, onToggleSelect }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: book.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  }

  const bookmarkColor = book.bookmarkSlot != null
    ? COLORS[BOOKMARK_KEYS[book.bookmarkSlot - 1]]
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--kanban-card-bg)',
        borderTopColor: selected ? 'var(--kanban-amber)' : 'var(--kanban-border)',
        borderRightColor: selected ? 'var(--kanban-amber)' : 'var(--kanban-border)',
        borderBottomColor: selected ? 'var(--kanban-amber)' : 'var(--kanban-border)',
        borderLeftColor: selected ? 'var(--kanban-amber)' : (bookmarkColor ?? 'var(--kanban-border)'),
        borderLeftWidth: (selected || bookmarkColor) ? '3px' : undefined,
        boxShadow: '2px 2px 0 var(--kanban-shadow)',
      }}
      className='group relative flex gap-2 border p-2.5'
      onClick={selectionMode ? () => onToggleSelect(book.id) : undefined}
    >

      {book.bookmarkSlot && !selectionMode &&
        <div
          className='bookmark-card-book'
          style={{ backgroundColor: COLORS[BOOKMARK_KEYS[book.bookmarkSlot - 1]] }}
        />
      }

      {/* Selection checkbox */}
      {selectionMode && (
        <div className='absolute left-1.5 top-1.5 z-10'>
          <input
            type='checkbox'
            checked={selected}
            onChange={() => onToggleSelect(book.id)}
            onClick={(e) => e.stopPropagation()}
            className='h-4 w-4 cursor-pointer rounded accent-amber-500'
          />
        </div>
      )}

      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        suppressHydrationWarning
        className={`flex cursor-grab items-start pt-0.5 active:cursor-grabbing ${selectionMode ? 'opacity-0 pointer-events-none' : ''}`}
        style={{ color: 'var(--kanban-muted)' }}
        aria-label='Drag'
      >
        ⠿
      </div>

      {/* Cover */}
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverUrl}
          alt={book.title}
          className='h-16 w-11 shrink-0 object-cover'
        />
      ) : (
        <div
          className='flex h-16 w-11 shrink-0 items-center justify-center text-xl'
          style={{ backgroundColor: 'var(--kanban-card-placeholder)' }}
        >
          📖
        </div>
      )}

      {/* Info */}
      <div className='min-w-0 flex-1'>
        <p
          className='line-clamp-2 text-sm font-medium leading-tight'
          style={{ color: 'var(--kanban-text)' }}
        >
          {book.title}
        </p>
        {book.author && (
          <p
            className='mt-0.5 truncate text-xs'
            style={{ color: 'var(--kanban-muted)' }}
          >
            {book.author}
          </p>
        )}
        {book.rating && (
          <p className='mt-1 text-xs text-amber-500'>
            {'★'.repeat(book.rating)}
            {'☆'.repeat(5 - book.rating)}
          </p>
        )}
        {book.favorite && (
          <span className='mt-0.5 inline-block text-xs'>⭐</span>
        )}
      </div>

      {/* Actions — shown on hover, hidden in selection mode */}
      {!selectionMode && (
        <div className='absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          <Button variant='icon' size='xs' onClick={() => onEdit(book)} aria-label='Edit'>✏</Button>
          <Button variant='icon' color='danger' size='xs' onClick={() => onDelete(book)} aria-label='Delete'>✕</Button>
        </div>
      )}
    </div>
  )
}

export const KanbanCardOverlay = ({ book }: { book: UserBookItem }) => {
  const bookmarkColor = book.bookmarkSlot != null
    ? COLORS[BOOKMARK_KEYS[book.bookmarkSlot - 1]]
    : undefined
  return (
    <div
      className='flex w-64 gap-2 border p-2.5'
      style={{
        backgroundColor: 'var(--kanban-card-bg)',
        borderTopColor: 'var(--kanban-amber)',
        borderRightColor: 'var(--kanban-amber)',
        borderBottomColor: 'var(--kanban-amber)',
        borderLeftColor: bookmarkColor ?? 'var(--kanban-amber)',
        borderLeftWidth: bookmarkColor ? '3px' : undefined,
        outline: '2px solid var(--kanban-amber)',
        boxShadow: '3px 3px 0 var(--kanban-rod)',
      }}
    >
      {book.bookmarkSlot &&
        <div
          className='bookmark-card-book'
          style={{ backgroundColor: COLORS[BOOKMARK_KEYS[book.bookmarkSlot - 1]] }}
        />
      }
      <div className='flex cursor-grabbing items-start pt-0.5' style={{ color: 'var(--kanban-muted)' }}>⠿</div>
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.coverUrl} alt={book.title} className='h-16 w-11 shrink-0 object-cover' />
      ) : (
        <div
          className='flex h-16 w-11 shrink-0 items-center justify-center text-xl'
          style={{ backgroundColor: 'var(--kanban-card-placeholder)' }}
        >
          📖
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 text-sm font-medium leading-tight' style={{ color: 'var(--kanban-text)' }}>
          {book.title}
        </p>
        {book.author && (
          <p className='mt-0.5 truncate text-xs' style={{ color: 'var(--kanban-muted)' }}>
            {book.author}
          </p>
        )}
        {book.rating && (
          <p className='mt-1 text-xs text-amber-500'>
            {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
          </p>
        )}
      </div>
    </div>
  )
}
