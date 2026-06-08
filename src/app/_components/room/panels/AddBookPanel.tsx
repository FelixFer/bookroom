'use client'

import { useEffect, useState } from 'react'
import { getJson, postJson } from '@/lib/api'
import { STATUS_LABELS, STATUS_ORDER } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { TBookMark } from './BookmarkPanel'

type Props = {
  onClose: () => void;
};

export const AddBookPanel = ({ onClose }: Props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState('PLAN_TO_READ')
  const [bookmark, setBookmark] = useState<number | null>(null)
  const [bookmarks, setBookmarks] = useState<TBookMark[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await postJson('/api/books', {
        title: title.trim(),
        author: author.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        status,
        bookmarkSlot: bookmark,
      })
      setSuccess(true)
      setTitle('')
      setAuthor('')
      setCoverUrl('')
      setStatus('PLAN_TO_READ')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getJson<{ data: TBookMark[] }>('/api/room/bookmarks?labeled=true')
      .then(res => {
        setBookmarks(res.data)
      })
      .catch(console.error)
  }, [])

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="text-4xl">📚</span>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Book added to your collection!
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setSuccess(false)}>Add another</Button>
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="form-label">
        <p>Title <span className="text-red-500">*</span></p>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Hobbit"
          required
        />
      </label>

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

      {error && <p className="form-error">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Add book
        </Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
      {loading && <LoaderOverlay />}
    </form>
  )
}
