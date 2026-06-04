"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { deleteJson } from "@/lib/api";
import type { UserBookItem } from "@/types/book";
import { Button } from "@/app/_components/Button";

type Props = {
  book: UserBookItem;
  onEdit: (book: UserBookItem) => void;
  onDeleted: (id: string) => void;
};

export const KanbanCard = ({ book, onEdit, onDeleted }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: book.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${book.title}" from your collection?`)) return;
    await deleteJson(`/api/books/${book.id}`);
    onDeleted(book.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex gap-2 rounded-lg border border-zinc-200 bg-[#EEEEEE] p-2.5 shadow-sm dark:border-zinc-800 dark:bg-[#191919]"
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="flex cursor-grab items-start pt-0.5 text-[#787A91] active:cursor-grabbing dark:text-[#BBBBBB]"
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
          className="h-16 w-11 shrink-0 rounded object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded bg-zinc-100 text-xl dark:bg-zinc-900">
          📖
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-tight text-zinc-900 dark:text-zinc-50">
          {book.title}
        </p>
        {book.author && (
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {book.author}
          </p>
        )}
        {book.rating && (
          <p className="mt-1 text-xs text-amber-500">
            {"★".repeat(book.rating)}
            {"☆".repeat(5 - book.rating)}
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
  );
};

export const KanbanCardOverlay = ({ book }: { book: UserBookItem }) => (
  <div className="flex w-64 gap-2 rounded-lg border border-blue-400 bg-blue-50 p-2.5 shadow-xl ring-2 ring-blue-300 dark:border-blue-500 dark:bg-blue-950/60 dark:ring-blue-600">
    <div className="flex cursor-grabbing items-start pt-0.5 text-zinc-300 dark:text-zinc-700">⠿</div>
    {book.coverUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={book.coverUrl} alt={book.title} className="h-16 w-11 shrink-0 rounded object-cover shadow-sm" />
    ) : (
      <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded bg-zinc-100 text-xl dark:bg-zinc-900">📖</div>
    )}
    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 text-sm font-medium leading-tight text-zinc-900 dark:text-zinc-50">{book.title}</p>
      {book.author && <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{book.author}</p>}
      {book.rating && (
        <p className="mt-1 text-xs text-amber-500">
          {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
        </p>
      )}
    </div>
  </div>
);
