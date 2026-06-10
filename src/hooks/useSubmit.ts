'use client'

import { useState } from 'react'
import { getApiErrorMessage } from '@/lib/api'

export const useSubmit = (action: () => Promise<void>, fallback = 'Something went wrong') => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await action()
    } catch (err) {
      setError(getApiErrorMessage(err, fallback))
    } finally {
      setLoading(false)
    }
  }

  return { handleSubmit, loading, error, setError }
}
