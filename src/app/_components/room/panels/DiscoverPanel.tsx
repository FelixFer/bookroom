'use client'

import { useState } from 'react'
import axios from 'axios'
import { postJson } from '@/lib/api'
import { DEFAULT_STATUS } from '@/types/book'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { EmptyState } from '@/app/_components/EmptyState'
import { BookCover } from '@/app/_components/BookCover'
import { FormError } from '@/app/_components/FormField'
import { useSubmit } from '@/hooks/useSubmit'

type OpenLibBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

const openLibCoverUrl = (coverId: number) =>
  `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`

export const DiscoverPanel = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OpenLibBook[]>([])
  // Track per-book state: "idle" | "adding" | "added" | "owned"
  const [bookState, setBookState] = useState<Record<string, 'adding' | 'added' | 'owned'>>({})

  const { handleSubmit: search, loading, error } = useSubmit(async () => {
    if (!query.trim()) return
    setResults([])
    setBookState({})
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=12&fields=key,title,author_name,cover_i,first_publish_year`,
    ).catch(() => null)
    if (!res?.ok) throw new Error('Could not reach Open Library. Check your connection.')
    const data = (await res.json()) as { docs: OpenLibBook[] }
    setResults(data.docs ?? [])
  }, 'Could not reach Open Library. Check your connection.')

  const addBook = async (book: OpenLibBook) => {
    setBookState((prev) => ({ ...prev, [book.key]: 'adding' }))
    try {
      await postJson('/api/books', {
        title: book.title,
        author: book.author_name?.[0] ?? null,
        coverUrl: book.cover_i ? openLibCoverUrl(book.cover_i) : null,
        status: DEFAULT_STATUS,
      })
      setBookState((prev) => ({ ...prev, [book.key]: 'added' }))
      window.dispatchEvent(new CustomEvent('books-updated'))
    } catch (err: unknown) {
      // 409 = already in collection
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setBookState((prev) => ({ ...prev, [book.key]: 'owned' }))
      } else {
        setBookState((prev) => {
          const next = { ...prev }
          delete next[book.key]
          return next
        })
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <form className="flex gap-2" onSubmit={search}>
        <input
          className="form-input flex-1 text-sm"
          placeholder="Search by title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="filled" loading={loading}>
          Search
        </Button>
      </form>
      {loading && <LoaderOverlay />}

      <FormError error={error} />

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <EmptyState emoji="🔍">
          Search millions of books from Open Library.
          <br />
          Find one and add it to your collection instantly.
        </EmptyState>
      )}

      {/* Loading */}
      {loading && (
        <p className="form-help text-center text-xs">Searching Open Library…</p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {results.map((book) => {
            const state = bookState[book.key]
            const coverUrl = book.cover_i ? openLibCoverUrl(book.cover_i) : null

            return (
              <div
                key={book.key}
                className="panel-card--shelf flex flex-col overflow-hidden"
              >
                {/* Cover */}
                <div className="flex h-32 items-center justify-center bg-room-bg">
                  <BookCover
                    coverUrl={coverUrl}
                    title={book.title}
                    className="h-full w-full object-cover"
                    placeholderClassName="text-3xl"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-2">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-room-text">
                    {book.title}
                  </p>
                  {book.author_name?.[0] && (
                    <p className="truncate text-xs text-room-muted">
                      {book.author_name[0]}
                    </p>
                  )}
                  {book.first_publish_year && (
                    <p className="text-xs text-room-muted">
                      {book.first_publish_year}
                    </p>
                  )}

                  {/* Add button */}
                  <Button
                    variant={state === 'added' ? 'soft' : state === 'owned' ? 'soft' : 'filled'}
                    color={state === 'added' ? 'success' : state === 'owned' ? 'grey' : 'primary'}
                    size="xs"
                    className="mt-auto w-full"
                    loading={state === 'adding'}
                    disabled={state === 'added' || state === 'owned'}
                    onClick={() => addBook(book)}
                  >
                    {state === 'added'
                      ? '✓ Added'
                      : state === 'owned'
                        ? 'Already in collection'
                        : '＋ Add'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
