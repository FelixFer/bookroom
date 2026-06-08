'use client'

import { useDroppable } from '@dnd-kit/core'
import { KanbanCard } from './KanbanCard'
import type { UserBookItem } from '@/types/book'
import { STATUS_LABELS, STATUS_COLORS } from '@/types/book'
import type { ReadingStatus } from '@/generated/prisma/enums'

type Props = {
  status: ReadingStatus;
  books: UserBookItem[];
  onEdit: (book: UserBookItem) => void;
  onDeleted: (id: string) => void;
};

export const KanbanColumn = ({ status, books, onEdit, onDeleted }: Props) => {
  const { isOver, setNodeRef } = useDroppable({ id: status })
  const colors = STATUS_COLORS[status]

  return (
    <div className="flex w-64 shrink-0 flex-col">
      {/* Top wooden rod */}
      <div className="h-3 shrink-0" style={{ backgroundColor: 'var(--kanban-rod)' }} />

      {/* Column body */}
      <div
        className="flex flex-1 flex-col border-x border-b"
        style={{ backgroundColor: 'var(--kanban-bg)', borderColor: 'var(--kanban-border)' }}
      >
        {/* Column header */}
        <div
          className="flex items-center justify-between border-b px-3 py-2.5"
          style={{
            backgroundColor: 'var(--kanban-header-bg)',
            borderColor: 'var(--kanban-border)',
            borderLeft: `3px solid ${colors.accent}`,
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.label }}
          >
            {STATUS_LABELS[status]}
          </span>
          <span
            className={`flex h-5 min-w-5 items-center justify-center px-1.5 text-xs font-bold text-white ${colors.badgeBg}`}
          >
            {books.length}
          </span>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`flex max-h-[65vh] flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors ${isOver ? 'bg-[#e8d5b0]/30 dark:bg-[#4a3a22]/30' : ''
            }`}
          style={{ minHeight: 120 }}
        >
          {books.map((b) => (
            <KanbanCard
              key={b.id}
              book={b}
              onEdit={onEdit}
              onDeleted={onDeleted}
            />
          ))}

          {books.length === 0 && (
            <p
              className="flex flex-1 items-center justify-center text-xs"
              style={{ color: 'var(--kanban-muted)' }}
            >
              Drop here
            </p>
          )}
        </div>
      </div>

      {/* Bottom wooden rod */}
      <div className="h-3 shrink-0" style={{ backgroundColor: 'var(--kanban-rod)' }} />
    </div>
  )
}
