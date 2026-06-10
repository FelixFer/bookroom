import type { ReadingStatus } from '@/generated/prisma/enums'

export type UserBookItem = {
  id: string;
  bookId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  status: ReadingStatus;
  bookmarkSlot: number | null;
  rating: number | null;
  notes: string | null;
  favorite: boolean;
  updatedAt: string; // ISO string (serialized from Prisma Date)
};

export const DEFAULT_STATUS: ReadingStatus = 'PLAN_TO_READ'

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  PLAN_TO_READ: 'Wishlist Shelf',
  READING: 'Reading Desk',
  ON_HOLD: 'Waiting Shelf',
  DROPPED: 'Abandoned Corner',
  COMPLETED: 'Finished Shelf',
  RE_READING: 'Favorite Re-reads',
}

export const STATUS_COLORS: Record<
  ReadingStatus,
  { accent: string; accentDark: string; label: string; labelDark: string; badgeBg: string }
> = {
  PLAN_TO_READ: {
    accent: '#6366f1',
    accentDark: '#818cf8',
    label: '#4338ca',
    labelDark: '#a5b4fc',
    badgeBg: 'bg-indigo-500 dark:bg-indigo-400',
  },
  READING: {
    accent: '#10b981',
    accentDark: '#34d399',
    label: '#047857',
    labelDark: '#6ee7b7',
    badgeBg: 'bg-emerald-500 dark:bg-emerald-400',
  },
  RE_READING: {
    accent: '#14b8a6',
    accentDark: '#2dd4bf',
    label: '#0f766e',
    labelDark: '#99f6e4',
    badgeBg: 'bg-teal-500 dark:bg-teal-400',
  },
  ON_HOLD: {
    accent: '#f59e0b',
    accentDark: '#fbbf24',
    label: '#b45309',
    labelDark: '#fde68a',
    badgeBg: 'bg-amber-500 dark:bg-amber-400',
  },
  COMPLETED: {
    accent: '#3b82f6',
    accentDark: '#60a5fa',
    label: '#1d4ed8',
    labelDark: '#93c5fd',
    badgeBg: 'bg-blue-500 dark:bg-blue-400',
  },
  DROPPED: {
    accent: '#f43f5e',
    accentDark: '#fb7185',
    label: '#be123c',
    labelDark: '#fda4af',
    badgeBg: 'bg-rose-500 dark:bg-rose-400',
  },
}

export const STATUS_ORDER: ReadingStatus[] = [
  'PLAN_TO_READ',
  'READING',
  'RE_READING',
  'ON_HOLD',
  'COMPLETED',
  'DROPPED',
]
