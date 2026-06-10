'use client'

import { useEffect, useState } from 'react'
import { postJson, patchJson, getJson } from '@/lib/api'
import type { UserBookItem } from '@/types/book'
import { STATUS_LABELS, STATUS_ORDER } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { TBookMark } from '@/app/_components/room/panels/BookmarkPanel'
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
  const [status, setStatus] = useState<string>(isEdit ? book.status : 'PLAN_TO_READ')
  const [rating, setRating] = useState<number | null>(isEdit ? book.rating : null)
  const [notes, setNotes] = useState(isEdit ? (book.notes ?? '') : '')
  const [favorite, setFavorite] = useState(isEdit ? book.favorite : false)
  const [bookmark, setBookmark] = useState<number | null>(isEdit ? (book.bookmarkSlot ?? null) : null)
  const [bookmarks, setBookmarks] = useState<TBookMark[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getJson<{ data: TBookMark[] }>('/api/room/bookmarks?labeled=true')
      .then(res => setBookmarks(res.data))
      .catch(console.error)
  }, [open, setBookmarks])

  if (!open) return null

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setError(null)
    setLoading(true)
    try {
      let result: UserBookItem
      if (isNew) {
        result = await postJson<UserBookItem>('/api/books', {
          title: title.trim(),
          author: author.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          status,
          bookmark,
        })
      } else {
        result = await patchJson<UserBookItem>(`/api/books/${book.id}`, {
          status,
          bookmarkSlot: bookmark,
          rating,
          notes: notes.trim() || null,
          favorite,
        })
      }
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoomModal open={open} title={isNew ? 'ADD BOOK' : 'EDIT BOOK'} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="form-label">
          <p>Title <span className="text-red-500">*</span></p>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isEdit}
            placeholder="e.g. The Hobbit"
            required
          />
        </label>

        {isNew && (
          <>
            <label className="form-label">
              Author
              <input
                className="form-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. J.R.R. Tolkien"
              />
            </label>
            <label className="form-label">
              Cover URL
              <input
                className="form-input"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>
          </>
        )}

        <label className="form-label">
          Status
          <select
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Bookmark
          <select
            className="form-input"
            value={bookmark ?? ''}
            onChange={(e) => setBookmark(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— No tag —</option>
            {bookmarks.map((b, i) => (
              <option key={i} value={b.slot}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

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

        {error && <p className="form-error">{error}</p>}

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
