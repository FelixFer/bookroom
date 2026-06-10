'use client'

import { useGet } from '@/hooks/useGet'
import { STATUS_LABELS, STATUS_ORDER } from '@/types/book'
import type { TBookMark } from '@/lib/bookmarks'
import { SelectField } from './FormField'

type StatusSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export const StatusSelect = ({ value, onChange }: StatusSelectProps) => (
  <SelectField label="Status" value={value} onChange={(e) => onChange(e.target.value)}>
    {STATUS_ORDER.map((s) => (
      <option key={s} value={s}>
        {STATUS_LABELS[s]}
      </option>
    ))}
  </SelectField>
)

type BookmarkSelectProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export const BookmarkSelect = ({ value, onChange }: BookmarkSelectProps) => {
  const { data: bookmarks } = useGet<{ data: TBookMark[] }, TBookMark[]>(
    '/api/room/bookmarks?labeled=true',
    (res) => res.data,
  )

  return (
    <SelectField
      label="Bookmark"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">— No tag —</option>
      {bookmarks?.map((b) => (
        <option key={b.slot} value={b.slot}>
          {b.label}
        </option>
      ))}
    </SelectField>
  )
}
