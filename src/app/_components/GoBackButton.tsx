'use client'

import { Button } from '@/app/_components/Button'

export function GoBackButton() {
  return (
    <Button variant="outline" onClick={() => window.history.back()}>
      Go Back
    </Button>
  )
}
