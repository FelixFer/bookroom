"use client";

import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { EditBookModal } from "./EditBookModal";
import { patchJson } from "@/lib/api";
import type { UserBookItem } from "@/types/book";
import { STATUS_ORDER } from "@/types/book";
import type { ReadingStatus } from "@/generated/prisma/enums";
import { Button } from "@/app/_components/Button";

type Props = {
  initialBooks: UserBookItem[];
};

export const KanbanBoard = ({ initialBooks }: Props) => {
  const [books, setBooks] = useState<UserBookItem[]>(initialBooks);
  const [editTarget, setEditTarget] = useState<UserBookItem | "new" | null>(null);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const bookId = active.id as string;
      const newStatus = over.id as ReadingStatus;
      const book = books.find((b) => b.id === bookId);
      if (!book || book.status === newStatus) return;

      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b)),
      );

      try {
        await patchJson(`/api/books/${bookId}`, { status: newStatus });
      } catch {
        // Revert on failure
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: book.status } : b)),
        );
      }
    },
    [books],
  );

  const handleSaved = useCallback((saved: UserBookItem) => {
    setBooks((prev) => {
      const exists = prev.some((b) => b.id === saved.id);
      return exists
        ? prev.map((b) => (b.id === saved.id ? saved : b))
        : [saved, ...prev];
    });
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const filtered = search
    ? books.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.author ?? "").toLowerCase().includes(search.toLowerCase()),
    )
    : books;

  const byStatus = (status: ReadingStatus) =>
    filtered.filter((b) => b.status === status);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Button href="/" variant="secondary">← Room</Button>

        <h1 className="mr-auto text-base font-semibold text-zinc-900 dark:text-zinc-50">
          My Collection
        </h1>

        {/* Search */}
        <input
          className="form-input h-9 w-40 text-sm"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button variant="primary" onClick={() => setEditTarget("new")}>+ Add Book</Button>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-4 pb-8">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              books={byStatus(status)}
              onEdit={setEditTarget}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      </DndContext>

      {/* Total count */}
      <div className="px-4 pb-2 text-xs text-zinc-400 dark:text-zinc-600">
        {books.length} book{books.length !== 1 ? "s" : ""} in your collection
        {search && ` · ${filtered.length} matching "${search}"`}
      </div>

      {/* Add/Edit modal */}
      <EditBookModal
        book={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleSaved}
      />
    </div>
  );
};
