"use client";

import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCardOverlay } from "./KanbanCard";
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
  const [activeBook, setActiveBook] = useState<UserBookItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const book = books.find((b) => b.id === event.active.id);
      setActiveBook(book ?? null);
    },
    [books],
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

      setActiveBook(null);

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
    <div className="relative flex min-h-screen flex-col">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat dark:hidden"
        style={{ backgroundImage: "url('/library-day.png')" }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block"
        style={{ backgroundImage: "url('/library-night.png')" }}
      />
      {/* <div className="pointer-events-none fixed inset-0 -z-10 bg-zinc-50/70 dark:bg-[#393E46]/80" /> */}
      <div className="pointer-events-none fixed inset-0 -z-10" />
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-3 border-b px-4 py-3"
        style={{ backgroundColor: "var(--kanban-header-bg)", borderColor: "var(--kanban-border)" }}
      >
        <Button href="/" variant="secondary">← Room</Button>

        <h1 className="text-base font-semibold" style={{ color: "var(--kanban-text)" }}>
          My Collection
        </h1>
      </div>

      <div className="flex justify-end gap-3 p-4">
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
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-4 pt-0">
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
        <DragOverlay>
          {activeBook ? <KanbanCardOverlay book={activeBook} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Total count */}
      <div className="px-4 py-2 text-xs" style={{ color: "var(--kanban-muted)" }}>
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
