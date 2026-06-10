export const BOOKMARK_KEYS = ['first', 'second', 'third', 'fourth', 'fifth'] as const

export type BookmarkKey = (typeof BOOKMARK_KEYS)[number]

export const BOOKMARK_COLORS: Record<BookmarkKey, string> = {
  first: '#4C7DFF',
  second: '#3FAF7A',
  third: '#D94A4A',
  fourth: '#9C72D9',
  fifth: '#D9A441',
}

export type TBookMark = {
  slot: number;
  label: string | null;
}

export const getBookmarkColor = (slot: number | null) =>
  slot != null ? BOOKMARK_COLORS[BOOKMARK_KEYS[slot - 1]] : undefined
