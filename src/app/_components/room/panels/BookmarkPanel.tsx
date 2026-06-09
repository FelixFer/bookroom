'use client'

import { useState, useRef, useEffect } from 'react'
import { LoaderOverlay } from '@/app/_components/Loader'
import { Button } from '@/app/_components/Button'
import { getJson, putJson } from '@/lib/api'

export const BOOKMARK_KEYS = ['first', 'second', 'third', 'fourth', 'fifth'] as const
const PLACEHOLDERS: Record<(typeof BOOKMARK_KEYS)[number], string> = {
  first: 'Favorites',
  second: 'Classics',
  third: 'Cozy Reads',
  fourth: 'Masterpiece',
  fifth: 'Buy Later',
}
export const COLORS: Record<(typeof BOOKMARK_KEYS)[number], string> = {
  first: '#4C7DFF',
  second: '#3FAF7A',
  third: '#D94A4A',
  fourth: '#9C72D9',
  fifth: '#D9A441',
}

type BookmarkKey = (typeof BOOKMARK_KEYS)[number];

export type TBookMark = {
  slot: number;
  label: string | null;
}

type Props = {
  isOpen: boolean;
};

export const BookmarkPanel = ({ isOpen }: Props) => {
  const [loading, setLoading] = useState(false)
  const [erasing, setErasing] = useState(false)
  const [focusIndex, setFocusIndex] = useState<BookmarkKey | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [bookmarks, setBookmarks] = useState<Record<BookmarkKey, string>>({
    first: '',
    second: '',
    third: '',
    fourth: '',
    fifth: '',
  })

  const clearBookmarks = () => {
    setBookmarks((prev) =>
      Object.fromEntries(
        Object.keys(prev).map((key) => [key, ''])
      ) as typeof prev
    )
  }

  const handleBookmarkChange = (key: BookmarkKey, value: string) => {
    setBookmarks((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = BOOKMARK_KEYS.map((key, i) => ({
      slot: i + 1,
      label: bookmarks[key],
    }))
    setLoading(true)
    try {
      await putJson('/api/room/bookmarks', data)
      window.dispatchEvent(new CustomEvent('bookmarks-updated'))
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const map = { first: '', second: '', third: '', fourth: '', fifth: '' }
    getJson<{ data: TBookMark[] }>('/api/room/bookmarks')
      .then(res => {
        for (const b of res.data) {
          const key = BOOKMARK_KEYS[b.slot - 1]
          if (key) map[key] = b.label ?? ''
        }
        setBookmarks(map)
      })
      .catch(console.error)
  }, [isOpen])

  return (
    <div className="bookmark-panel">
      <div className="mb-4">
        <p className="pr-4 text-xs text-[#6b5030] dark:text-[#cdb892]">
          These bookmarks appear as small ribbons on your books.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {BOOKMARK_KEYS.map((i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="form-label relative flex-1">
              <input
                ref={(el) => { inputRefs.current[BOOKMARK_KEYS.indexOf(i)] = el }}
                className="form-input pr-8 w-full"
                value={bookmarks[i]}
                onChange={(e) => handleBookmarkChange(i, e.target.value)}
                placeholder={PLACEHOLDERS[i]}
                onFocus={() => setFocusIndex(i)}
                onBlur={() => setFocusIndex(null)}
              />
              {bookmarks[i] && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 leading-none text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300"
                  onClick={() => handleBookmarkChange(i, '')}
                  aria-label={`Clear ${PLACEHOLDERS[i]}`}
                >
                  ✕
                </button>
              )}
            </label>
            <div
              className={`bookmark-sideway ${focusIndex === i ? 'bookmark-sideway-active' : ''}`}
              style={{ background: COLORS[i] }}
              onClick={() => {
                setFocusIndex(i)
                inputRefs.current[BOOKMARK_KEYS.indexOf(i)]?.focus()
              }}
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Save Changes
          </Button>
          <button
            type="button"
            className={`eraser-btn${erasing ? ' eraser-btn--wiping' : ''}`}
            onClick={() => {
              if (erasing) return
              setErasing(true)
              clearBookmarks()
            }}
            onAnimationEnd={() => setErasing(false)}
            aria-label="Clear all bookmarks"
          >🗑️</button>
        </div>
        {loading && <LoaderOverlay />}
      </form>
    </div>
  )
}
