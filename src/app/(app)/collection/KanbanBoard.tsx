'use client'

import { useState, useCallback, useEffect } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardOverlay } from './KanbanCard'
import { EditBookModal } from './EditBookModal'
import { DeleteBookModal } from './DeleteBookModal'
import { RoomModal } from '@/app/_components/room/RoomModal'
import { patchJson, getJson, deleteJson } from '@/lib/api'
import type { UserBookItem } from '@/types/book'
import { STATUS_ORDER } from '@/types/book'
import type { ReadingStatus } from '@/generated/prisma/enums'
import { Button } from '@/app/_components/Button'

export const KanbanBoard = () => {
  const [books, setBooks] = useState<UserBookItem[]>([])
  const [editTarget, setEditTarget] = useState<UserBookItem | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserBookItem | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [activeBook, setActiveBook] = useState<UserBookItem | null>(null)

  const fetchBooks = useCallback(() => {
    getJson<{ books: UserBookItem[] }>('/api/room/books')
      .then((res) => setBooks(res.books))
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetchBooks()
    window.addEventListener('bookmarks-updated', fetchBooks)
    return () => window.removeEventListener('bookmarks-updated', fetchBooks)
  }, [fetchBooks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const book = books.find((b) => b.id === event.active.id)
      setActiveBook(book ?? null)
    },
    [books],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const bookId = active.id as string
      const newStatus = over.id as ReadingStatus
      const book = books.find((b) => b.id === bookId)
      if (!book || book.status === newStatus) return

      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b)),
      )

      setActiveBook(null)

      try {
        await patchJson(`/api/books/${bookId}`, { status: newStatus })
      } catch {
        // Revert on failure
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: book.status } : b)),
        )
      }
    },
    [books],
  )

  const handleSaved = useCallback((saved: UserBookItem) => {
    setBooks((prev) => {
      const exists = prev.some((b) => b.id === saved.id)
      return exists
        ? prev.map((b) => (b.id === saved.id ? saved : b))
        : [saved, ...prev]
    })
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true)
    try {
      await Promise.all([...selectedIds].map((id) => deleteJson(`/api/books/${id}`)))
      setBooks((prev) => prev.filter((b) => !selectedIds.has(b.id)))
      clearSelection()
      setBulkConfirmOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setBulkDeleting(false)
    }
  }, [selectedIds, clearSelection])

  const filtered = search
    ? books.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.author ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    : books

  const byStatus = (status: ReadingStatus) =>
    filtered.filter((b) => b.status === status)

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
      <div className="pointer-events-none fixed inset-0 -z-10" />
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-3 border-b px-4 py-3"
        style={{ backgroundColor: 'var(--kanban-header-bg)', borderColor: 'var(--kanban-border)' }}
      >
        <Button href="/" variant="secondary">← Room</Button>

        <h1 className="text-base font-semibold" style={{ color: 'var(--kanban-text)' }}>
          My Collection
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4">
        <Button
          variant="soft"
          onClick={() => selectionMode ? clearSelection() : setSelectionMode(true)}
        >
          {selectionMode ? 'Cancel' : 'Select'}
        </Button>

        <div className="flex flex-1 justify-end gap-3">
          {/* Search */}
          <input
            className="form-input h-9 w-40 text-sm"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {!selectionMode && (
            <Button variant="primary" onClick={() => setEditTarget('new')}>+ Add Book</Button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectionMode && (
        <div
          className="flex flex-wrap items-center gap-3 border-b px-4 py-2"
          style={{ backgroundColor: 'var(--kanban-header-bg)', borderColor: 'var(--kanban-border)' }}
        >
          <span className="text-sm" style={{ color: 'var(--kanban-muted)' }}>
            {selectedIds.size} selected
          </span>
          <Button variant="soft" onClick={() => setSelectedIds(new Set(filtered.map((b) => b.id)))}>Select all</Button>
          <Button variant="soft" onClick={() => setSelectedIds(new Set())}>Deselect all</Button>
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={() => setBulkConfirmOpen(true)}>
              Delete {selectedIds.size} book{selectedIds.size !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-4 pt-0">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              books={byStatus(status)}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
        <DragOverlay>
          {activeBook ? <KanbanCardOverlay book={activeBook} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Total count */}
      <div className="px-4 py-2 text-xs" style={{ color: 'var(--kanban-muted)' }}>
        {books.length} book{books.length !== 1 ? 's' : ''} in your collection
        {search && ` · ${filtered.length} matching "${search}"`}
      </div>

      {/* Add/Edit modal */}
      <EditBookModal
        key={editTarget === null ? 'closed' : (editTarget === 'new' ? 'new' : `edit-${editTarget.id}`)}
        book={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleSaved}
      />

      {/* Single delete confirm */}
      <DeleteBookModal
        book={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />

      {/* Bulk delete confirm */}
      <RoomModal open={bulkConfirmOpen} title="DELETE BOOKS" onClose={() => setBulkConfirmOpen(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Remove <span className="font-semibold text-zinc-900 dark:text-zinc-50">{selectedIds.size} book{selectedIds.size !== 1 ? 's' : ''}</span> from your collection? This can&apos;t be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" loading={bulkDeleting} onClick={handleBulkDelete} className="flex-1">
              Delete {selectedIds.size} book{selectedIds.size !== 1 ? 's' : ''}
            </Button>
            <Button variant="secondary" onClick={() => setBulkConfirmOpen(false)}>Cancel</Button>
          </div>
        </div>
      </RoomModal>
    </div>
  )

}
