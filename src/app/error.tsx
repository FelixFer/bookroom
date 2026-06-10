'use client'

import { useEffect } from 'react'
import { Button } from '@/app/_components/Button'
import { EmptyState } from '@/app/_components/EmptyState'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="page-center">
      <EmptyState
        emoji="😵"
        action={
          <Button variant="filled" onClick={reset}>
            Try again
          </Button>
        }
      >
        Something went wrong. Please try again.
      </EmptyState>
    </div>
  )
}
