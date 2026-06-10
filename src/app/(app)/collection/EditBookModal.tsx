'use client'

import { useState } from 'react'
import { postJson, patchJson } from '@/lib/api'
import type { UserBookItem } from '@/types/book'
import { DEFAULT_STATUS } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { TextField, FormError } from '@/app/_components/FormField'
import { StatusSelect, BookmarkSelect } from '@/app/_components/BookFormFields'
import { useSubmit } from '@/hooks/useSubmit'
import { RoomModal } from '@/app/_components/room/RoomModal'

type Props = {
  book: UserBookItem | 'new' | null; // null = closed, "new" = create mode
  onClose: () => void;
  onSaved: (book: UserBookItem) => void;
};

export const EditBookModal = ({ book, onClose, onSaved }: Props) => {
  const isNew = book === 'new'
  const isEdit = book !== null && book !== 'new'
  const open = book !== null

  const [title, setTitle] = useState(isEdit ? book.title : '')
  const [author, setAuthor] = useState(isEdit ? (book.author ?? '') : '')
  const [coverUrl, setCoverUrl] = useState(isEdit ? (book.coverUrl ?? '') : '')
  const [status, setStatus] = useState<string>(isEdit ? book.status : DEFAULT_STATUS)
  const [rating, setRating] = useState<number | null>(isEdit ? book.rating : null)
  const [notes, setNotes] = useState(isEdit ? (book.notes ?? '') : '')
  const [favorite, setFavorite] = useState(isEdit ? book.favorite : false)
  const [bookmark, setBookmark] = useState<number | null>(isEdit ? (book.bookmarkSlot ?? null) : null)

  const { handleSubmit, loading, error } = useSubmit(async () => {
    if (!title.trim()) throw new Error('Title is required')
    let result: UserBookItem
    if (book !== null && book !== 'new') {
      result = await patchJson<UserBookItem>(`/api/books/${book.id}`, {
        status,
        bookmarkSlot: bookmark,
        rating,
        notes: notes.trim() || null,
        favorite,
      })
    } else {
      result = await postJson<UserBookItem>('/api/books', {
        title: title.trim(),
        author: author.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        status,
        bookmarkSlot: bookmark,
      })
    }
    onSaved(result)
    onClose()
  })

  if (!open) return null

  return (
    <RoomModal open={open} title={isNew ? 'ADD BOOK' : 'EDIT BOOK'} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label={<p>Title <span className="text-red-500">*</span></p>}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isEdit}
          placeholder="e.g. The Hobbit"
          required
        />

        {isNew && (
          <>
            <TextField
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. J.R.R. Tolkien"
            />
            <TextField
              label="Cover URL"
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://…"
            />
          </>
        )}

        <StatusSelect value={status} onChange={setStatus} />

        <BookmarkSelect value={bookmark} onChange={setBookmark} />

        {isEdit && (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="text-xl leading-none"
                    onClick={() => setRating(rating === n ? null : n)}
                    aria-label={`${n} star`}
                  >
                    {n <= (rating ?? 0) ? '★' : '☆'}
                  </button>
                ))}
                {rating && (
                  <button
                    type="button"
                    className="ml-2 text-xs text-zinc-400 underline"
                    onClick={() => setRating(null)}
                  >
                    clear
                  </button>
                )}
              </div>
            </div>

            <label className="form-label">
              Notes
              <textarea
                className="form-input min-h-20 resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Your thoughts…"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Mark as favourite ⭐
            </label>
          </>
        )}

        <FormError error={error} />

        <div className="flex gap-3 pt-1">
          <Button type="submit" variant="filled" loading={loading} className="flex-1">
            {isNew ? 'Add book' : 'Save changes'}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
        {loading && <LoaderOverlay />}
      </form>
    </RoomModal>
  )
}
