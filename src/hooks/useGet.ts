'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getJson } from '@/lib/api'

export const useGet = <TResponse, TData = TResponse>(
  url: string | null,
  select?: (res: TResponse) => TData,
  refetchEvent?: string,
) => {
  const [data, setData] = useState<TData | null>(null)
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null)
  const selectRef = useRef(select)

  useEffect(() => {
    selectRef.current = select
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
    if (!url || !refetchEvent) return
    window.addEventListener(refetchEvent, refetch)
    return () => window.removeEventListener(refetchEvent, refetch)
  }, [url, refetchEvent, refetch])

  const loading = url !== null && fetchedUrl !== url

  return { data, loading, refetch }
}
