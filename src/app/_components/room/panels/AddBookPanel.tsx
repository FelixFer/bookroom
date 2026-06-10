'use client'

import { useState } from 'react'
import { postJson } from '@/lib/api'
import { DEFAULT_STATUS } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { TextField, FormError } from '@/app/_components/FormField'
import { StatusSelect, BookmarkSelect } from '@/app/_components/BookFormFields'
import { useSubmit } from '@/hooks/useSubmit'

type Props = {
  onClose: () => void;
};

export const AddBookPanel = ({ onClose }: Props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<string>(DEFAULT_STATUS)
  const [bookmark, setBookmark] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)

  const { handleSubmit, loading, error } = useSubmit(async () => {
    if (!title.trim()) throw new Error('Title is required')
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
    setStatus(DEFAULT_STATUS)
  })

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="text-4xl">📚</span>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Book added to your collection!
        </p>
        <div className="flex gap-3">
          <Button variant="filled" onClick={() => setSuccess(false)}>Add another</Button>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField
        label={<p>Title <span className="text-red-500">*</span></p>}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. The Hobbit"
        required
      />

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

      <StatusSelect value={status} onChange={setStatus} />

      <BookmarkSelect value={bookmark} onChange={setBookmark} />

      <FormError error={error} />

      <div className="flex gap-3">
        <Button type="submit" variant="filled" loading={loading} className="flex-1">
          Add book
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
      {loading && <LoaderOverlay />}
    </form>
  )
}
