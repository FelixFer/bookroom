'use client'

import { useEffect, useState } from 'react'
import { getJson } from '@/lib/api'

type Stats = {
  totalBooks: number;
  doneCount: number;
  doneThisYear: number;
  currentlyReading: number;
  favoriteCount: number;
  dnfCount: number;
};

export const StatsPanel = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson<Stats>('/api/room/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="form-help">Loading stats…</p>
  if (!stats) return <p className="form-error">Failed to load stats.</p>

  const year = new Date().getFullYear()

  const items = [
    { label: 'Total books',       value: stats.totalBooks,     emoji: '📚' },
    { label: `Completed in ${year}`, value: stats.doneThisYear, emoji: '✅' },
    { label: 'Completed all time', value: stats.doneCount,      emoji: '🏆' },
    { label: 'Currently reading',  value: stats.currentlyReading, emoji: '📖' },
    { label: 'Favourites',         value: stats.favoriteCount,  emoji: '⭐' },
    { label: 'Dropped',            value: stats.dnfCount,       emoji: '🗑️' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ label, value, emoji }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {emoji} {label}
          </span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
