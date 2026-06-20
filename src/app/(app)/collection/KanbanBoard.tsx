'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
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
import type { TBookMark } from '@/lib/bookmarks'
import { useGet } from '@/hooks/useGet'

export type filterSelection = {
  included: number[] | null
  excluded: number[] | null
}

export const KanbanBoard = () => {
  const [books, setBooks] = useState<UserBookItem[]>([])
  const { data: bookmarksData } = useGet<{ data: TBookMark[] }, TBookMark[]>(
    '/api/room/bookmarks?labeled=true',
    (res) => res.data,
    ['bookmarks-updated', 'books-updated'],
  )
  const bookmarks = bookmarksData ?? []
  const [editTarget, setEditTarget] = useState<UserBookItem | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserBookItem | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState<filterSelection>({
    included: [],
    excluded: [],
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [activeBook, setActiveBook] = useState<UserBookItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const [errorToast, setErrorToast] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false })

  useEffect(() => {
    if (!errorToast) return
    const t = setTimeout(() => setErrorToast(''), 4000)
    return () => clearTimeout(t)
  }, [errorToast])

  const updateScrollEdges = useCallback(() => {
    const el = boardRef.current
    if (!el) return
    setScrollEdges({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    updateScrollEdges()
    window.addEventListener('resize', updateScrollEdges)
    return () => window.removeEventListener('resize', updateScrollEdges)
  }, [updateScrollEdges])

  const fetchBooks = useCallback(() => {
    getJson<{ books: UserBookItem[] }>('/api/room/books')
      .then((res) => setBooks(res.books))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchBooks()
    window.addEventListener('bookmarks-updated', fetchBooks)
    window.addEventListener('books-updated', fetchBooks)
    return () => {
      window.removeEventListener('bookmarks-updated', fetchBooks)
      window.removeEventListener('books-updated', fetchBooks)
    }
  }, [fetchBooks])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key < '1' || e.key > '6') return
      if (selectionMode) return

      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

      const card = target.closest('[data-book-id]')
      if (!card) return

      const bookId = card.getAttribute('data-book-id')
      if (!bookId) return
      const statusIndex = parseInt(e.key) - 1
      const newStatus = STATUS_ORDER[statusIndex]

      const book = books.find(b => b.id === bookId)
      if (!book || book.status === newStatus) return

      patchJson(`/api/books/${bookId}`, { status: newStatus })
        .then(() => {
          window.dispatchEvent(new CustomEvent('books-updated'))
          setAnnouncement(`Status changed to ${newStatus.replace(/_/g, ' ')}`)
        })
        .catch((err) => {
          setErrorToast('Failed to update status')
        })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [books, selectionMode])

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
        setAnnouncement(`${book.title} moved to ${newStatus.replaceAll('_', ' ').toLowerCase()}`)
      } catch {
        // Revert on failure
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: book.status } : b)),
        )
        setAnnouncement(`Failed to move ${book.title}`)
        setErrorToast(`Couldn't move '${book.title}'. Please try again.`)
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
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
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

  const handleFilterStatus = useCallback((slot: number) => {
    setFilter((prev) => {
      const inIncluded = prev.included?.includes(slot)
      const inExcluded = prev.excluded?.includes(slot)

      if (!inIncluded && !inExcluded) {
        return { ...prev, included: [...(prev.included ?? []), slot] }
      }
      if (inIncluded) {
        return {
          included: prev.included?.filter((s) => s !== slot) ?? [],
          excluded: [...(prev.excluded ?? []), slot],
        }
      }
      if (inExcluded) {
        return {
          ...prev,
          excluded: prev.excluded?.filter((s) => s !== slot) ?? [],
        }
      }
      return prev
    })
  }, [])

  const filtered = useMemo(() => {
    let result = search
      ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          (b.author ?? '').toLowerCase().includes(search.toLowerCase()),
      )
      : books

    if (filter.included?.length) {
      result = result.filter((book) =>
        book.bookmarkSlot !== null && filter.included!.includes(book.bookmarkSlot)
      )
    }

    if (filter.excluded?.length) {
      result = result.filter((book) =>
        book.bookmarkSlot === null || !filter.excluded!.includes(book.bookmarkSlot)
      )
    }

    return result
  }, [books, search, filter])

  const byStatus = (status: ReadingStatus) =>
    filtered.filter((b) => b.status === status)

  const noMatches = !loading && books.length > 0 && filtered.length === 0

  useEffect(() => {
    updateScrollEdges()
  }, [filtered.length, updateScrollEdges])

  return (
    <div className='relative flex h-dvh flex-col overflow-hidden pb-2'>
      <div
        className='pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat dark:hidden'
        style={{ backgroundImage: "url('/library-day.png')" }}
      />
      <div
        className='pointer-events-none fixed inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block'
        style={{ backgroundImage: "url('/library-night.png')" }}
      />
      <div className='pointer-events-none fixed inset-0 -z-10' />
      {/* Header */}
      <div
        className='flex flex-wrap items-center gap-3 border-b px-4 py-3'
        style={{ backgroundColor: 'var(--kanban-header-bg)', borderColor: 'var(--kanban-border)' }}
      >
        <Button href='/' variant='outline'>← Room</Button>

        <h1 className='text-base font-semibold max-sm:sr-only' style={{ color: 'var(--kanban-text)' }}>
          My Collection
        </h1>
      </div>

      <div className='flex flex-col gap-3 p-4 pb-2'>
        {/* Search */}
        <div className='relative'>
          <input
            className='form-input h-9 w-full pr-8 text-sm'
            placeholder='Search…'
            value={search}
            maxLength={40}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type='button'
              className='absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 leading-none'
              style={{ color: 'var(--kanban-muted)' }}
              onClick={() => setSearch('')}
              aria-label='Clear search'
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions */}
        <div className='flex flex-wrap items-center gap-3'>
          {!selectionMode && (
            <Button variant='filled' size='s' onClick={() => setEditTarget('new')}>+ Add Book</Button>
          )}

          <Button
            variant='soft'
            size='s'
            onClick={() => setShowFilter((prev) => !prev)}
          >
            {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
          </Button>

          <Button
            variant='soft'
            color='grey'
            size='s'
            className='sm:ml-auto'
            onClick={() => selectionMode ? clearSelection() : setSelectionMode(true)}
          >
            {selectionMode ? 'Done' : 'Tidy up'}
          </Button>
        </div>

        {/* Collection count */}
        <p
          className='w-fit rounded border px-2 py-0.5 text-xs'
          style={{ color: 'var(--kanban-text)', backgroundColor: 'var(--kanban-header-bg)', borderColor: 'var(--kanban-border)' }}
        >
          {books.length} book{books.length !== 1 ? 's' : ''} in your collection
          {search && ` · ${filtered.length} matching '${search}'`}
        </p>
      </div>

      <div className={`filter-panel ${showFilter ? 'filter-panel-show' : ''}`}>
        {bookmarks.length ? (
          <>
            <span className='filter-label'>Filter by bookmark</span>
            <div className='filter-list'>
              {bookmarks.map((b) => {
                const included = filter.included?.includes(b.slot)
                const excluded = filter.excluded?.includes(b.slot)
                const state = included ? 'including' : excluded ? 'excluding' : null
                return (
                  <button
                    key={b.slot}
                    type='button'
                    className={`filter-pill ${included ? 'filter-pill-included' : ''} ${excluded ? 'filter-pill-excluded' : ''}`}
                    aria-label={state ? `${b.label}: ${state}` : (b.label ?? undefined)}
                    onClick={() => handleFilterStatus(b.slot)}
                  >
                    {b.label}
                  </button>
                )
              })}
              <span className='filter-hint'>Tap to include · again to exclude</span>
            </div>
            <Button
              variant='soft'
              size='s'
              onClick={() => setFilter({ included: [], excluded: [] })}
              disabled={!filter.excluded?.length && !filter.included?.length}
            >
              Reset
            </Button>
          </>
        ) : (
          <p className='text-sm' style={{ color: 'var(--kanban-text)' }}>
            No bookmarks yet — <button type='button' onClick={() => window.dispatchEvent(new CustomEvent('open-bookmarks'))} className='underline underline-offset-2'>open the Bookmarks panel</button> to create them, then filter books by shelf.
          </p>
        )}
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className='relative min-h-0 flex-1'>
          {loading && (
            <div
              className='flex h-full items-center justify-center p-4 text-sm'
              style={{ color: 'var(--kanban-muted)' }}
            >
              Tidying your shelves…
            </div>
          )}
          {noMatches && (
            <div
              className='flex h-full items-center justify-center p-4 text-center text-sm'
              style={{ color: 'var(--kanban-muted)' }}
            >
              {search
                ? `No books match “${search}”`
                : 'No books match the current filter'}
            </div>
          )}
          <div
            ref={boardRef}
            onScroll={updateScrollEdges}
            className={`flex h-full gap-4 overflow-x-auto p-4 pt-0 kanban-scroll ${loading || noMatches ? 'hidden' : ''}`}
          >
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
          {!loading && !noMatches && scrollEdges.left && (
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-y-0 left-0 w-8'
              style={{ background: 'linear-gradient(to right, var(--kanban-scroll-fade), transparent)' }}
            />
          )}
          {!loading && !noMatches && scrollEdges.right && (
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-y-0 right-0 w-8'
              style={{ background: 'linear-gradient(to left, var(--kanban-scroll-fade), transparent)' }}
            />
          )}
        </div>
        <DragOverlay>
          {activeBook ? <KanbanCardOverlay book={activeBook} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Selection tray — only while tidying up */}
      {selectionMode && (
        <div
          className='fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded border px-4 py-2.5 text-sm shadow-lg'
          style={{ backgroundColor: 'var(--kanban-header-bg)', borderColor: 'var(--kanban-border)', color: 'var(--kanban-text)' }}
        >
          {selectedIds.size === 0 ? (
            <span style={{ color: 'var(--kanban-muted)' }}>Tap books to remove them</span>
          ) : (
            <>
              <span>{selectedIds.size} selected</span>
              <Button variant='filled' color='danger' size='s' onClick={() => setBulkConfirmOpen(true)}>
                Remove
              </Button>
              <button
                type='button'
                onClick={() => setSelectedIds(new Set())}
                className='underline underline-offset-2'
                style={{ color: 'var(--kanban-muted)' }}
              >
                Clear
              </button>
            </>
          )}
        </div>
      )}

      <div aria-live='polite' className='sr-only'>{announcement}</div>

      {errorToast && (
        <div
          role='alert'
          className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border px-4 py-2.5 text-sm shadow-lg'
          style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--kanban-border)', color: '#fff' }}
        >
          <span>{errorToast}</span>
          <button
            type='button'
            onClick={() => setErrorToast('')}
            aria-label='Dismiss'
            className='text-white/80 hover:text-white'
          >
            ✕
          </button>
        </div>
      )}

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
      <RoomModal open={bulkConfirmOpen} title='DELETE BOOKS' onClose={() => setBulkConfirmOpen(false)}>
        <div className='flex flex-col gap-4'>
          <p className='text-sm text-kanban-muted'>
            Remove <span className='font-semibold text-kanban-text'>{selectedIds.size} book{selectedIds.size !== 1 ? 's' : ''}</span>&nbsp;from your collection? This can&apos;t be undone.
          </p>
          <div className='flex gap-3'>
            <Button variant='filled' color='danger' loading={bulkDeleting} onClick={handleBulkDelete} className='flex-1'>
              Delete {selectedIds.size} book{selectedIds.size !== 1 ? 's' : ''}
            </Button>
            <Button variant='outline' onClick={() => setBulkConfirmOpen(false)}>Cancel</Button>
          </div>
        </div>
      </RoomModal>
    </div>
  )

}
