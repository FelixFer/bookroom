"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import type { UserBookItem } from "@/types/book";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/book";
import type { ReadingStatus } from "@/generated/prisma/enums";

type Props = {
  status: ReadingStatus;
  books: UserBookItem[];
  onEdit: (book: UserBookItem) => void;
  onDeleted: (id: string) => void;
};

export const KanbanColumn = ({ status, books, onEdit, onDeleted }: Props) => {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const colors = STATUS_COLORS[status];

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* Column header */}
      <div
        className={`flex items-center justify-between rounded-t-xl border-b px-3 py-2.5 ${colors.bg} ${colors.border}`}
      >
        <span className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}>
          {STATUS_LABELS[status]}
        </span>
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${colors.bg} ${colors.text}`}
        >
          {books.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 p-2 transition-colors ${isOver ? "bg-zinc-100 dark:bg-zinc-800/50" : ""
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
          <p className="flex flex-1 items-center justify-center text-xs text-zinc-400 dark:text-zinc-600">
            Drop here
          </p>
        )}
      </div>
    </div>
  );
};
