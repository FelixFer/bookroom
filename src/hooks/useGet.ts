'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getJson } from '@/lib/api'

export const useGet = <TResponse, TData = TResponse>(
  url: string | null,
  select?: (res: TResponse) => TData,
  refetchEvent?: string | string[],
) => {
  const [data, setData] = useState<TData | null>(null)
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null)
  const selectRef = useRef(select)
  const refetchEventRef = useRef(refetchEvent)

  useEffect(() => {
    selectRef.current = select
  })

  useEffect(() => {
    refetchEventRef.current = refetchEvent
  })

  const refetch = useCallback(() => {
    if (!url) return
    getJson<TResponse>(url)
      .then((res) => {
        const pick = selectRef.current
        setData(pick ? pick(res) : (res as unknown as TData))
      })
      .catch(console.error)
      .finally(() => setFetchedUrl(url))
  }, [url])

  useEffect(() => {
    refetch()
    if (!url || !refetchEventRef.current) return

    const events = Array.isArray(refetchEventRef.current) ? refetchEventRef.current : [refetchEventRef.current]
    events.forEach(event => window.addEventListener(event, refetch))

    return () => {
      events.forEach(event => window.removeEventListener(event, refetch))
    }
  }, [url, refetch])

  const loading = url !== null && fetchedUrl !== url

  return { data, loading, refetch }
}
