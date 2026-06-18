'use client'

import { useGet } from '@/hooks/useGet'
import { LoaderOverlay } from '@/app/_components/Loader';

type Stats = {
  totalBooks: number;
  doneCount: number;
  doneThisYear: number;
  currentlyReading: number;
  favoriteCount: number;
  dnfCount: number;
};

export const StatsPanel = () => {
  const { data: stats, loading } = useGet<Stats>(
    '/api/room/stats',
    undefined,
    'books-updated'
  )

  if (loading) return <LoaderOverlay />
  if (!stats) return <p className="form-error">Failed to load stats.</p>

  const year = new Date().getFullYear()

  const items = [
    { label: 'Total books', value: stats.totalBooks, emoji: '📚' },
    { label: `Completed in ${year}`, value: stats.doneThisYear, emoji: '✅' },
    { label: 'Completed all time', value: stats.doneCount, emoji: '🏆' },
    { label: 'Currently reading', value: stats.currentlyReading, emoji: '📖' },
    { label: 'Favorites', value: stats.favoriteCount, emoji: '⭐' },
    { label: 'Dropped', value: stats.dnfCount, emoji: '🗑️' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {items.map(({ label, value, emoji }) => (
        <div
          key={label}
          className="panel-card--shelf flex items-center justify-between"
        >
          <span className="text-sm text-room-muted">
            <span aria-hidden='true'>{emoji} </span>
            {label}
          </span>
          <span className="text-xl font-bold text-room-text">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
