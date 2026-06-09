'use client'

import { useState, useCallback } from 'react'
import { getJson } from '@/lib/api'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'

type Book = {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  status: string;
};

export const CatPanel = () => {
  const [book, setBook] = useState<Book | null | 'empty'>(null)
  const [loading, setLoading] = useState(false)

  const roll = useCallback(() => {
    setLoading(true)
    getJson<{ book: Book | null }>('/api/room/random')
      .then((data) => setBook(data.book ?? 'empty'))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
    <div className="flex flex-col items-center gap-6 pt-4 text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        🐱 The cat has a recommendation for you…
      </p>

      {book === null && (
        <Button variant="primary" onClick={roll} loading={loading}>
          Surprise me!
        </Button>
      )}

      {book === 'empty' && (
        <p className="form-help">Your shelf is empty. Add some books first!</p>
      )}

      {book && book !== 'empty' && (
        <div className="flex flex-col items-center gap-4">
          {book.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-48 w-auto rounded-lg shadow-md object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {book.title}
            </p>
            {book.author && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {book.author}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              {book.status.replace('_', ' ')}
            </p>
          </div>
          <Button variant="secondary" onClick={roll} loading={loading}>
            🎲 Roll again
          </Button>
        </div>
      )}
    </div>
    {loading && <LoaderOverlay />}
    </>
  )
}
