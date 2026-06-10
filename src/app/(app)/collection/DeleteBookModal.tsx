'use client'

import { useState } from 'react'
import { deleteJson } from '@/lib/api'
import type { UserBookItem } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { RoomModal } from '@/app/_components/room/RoomModal'

type Props = {
  book: UserBookItem | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
};

export const DeleteBookModal = ({ book, onClose, onDeleted }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!book) return
    setLoading(true)
    setError(null)
    try {
      await deleteJson(`/api/books/${book.id}`)
      onDeleted(book.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoomModal open={book !== null} title="REMOVE BOOK" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Remove <span className="font-semibold text-zinc-900 dark:text-zinc-50">{book?.title}</span> from your collection?
        </p>
        {error && <p className="form-error">{error}</p>}
        <div className="flex gap-3">
          <Button variant="filled" color="danger" loading={loading} onClick={handleConfirm} className="flex-1">
            Remove
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </RoomModal>
  )
}
