import type { ReadingStatus } from "@/generated/prisma/enums";

export type UserBookItem = {
  id: string;
  bookId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  status: ReadingStatus;
  rating: number | null;
  notes: string | null;
  favorite: boolean;
  updatedAt: string; // ISO string (serialized from Prisma Date)
};

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  PLAN_TO_READ: "Plan to Read",
  READING: "Reading",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
  COMPLETED: "Completed",
  RE_READING: "Re-reading",
};

export const STATUS_COLORS: Record<
  ReadingStatus,
  { bg: string; text: string; border: string }
> = {
  PLAN_TO_READ: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  READING: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  RE_READING: {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
  ON_HOLD: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  COMPLETED: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  DROPPED: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
};

export const STATUS_ORDER: ReadingStatus[] = [
  "PLAN_TO_READ",
  "READING",
  "RE_READING",
  "ON_HOLD",
  "COMPLETED",
  "DROPPED",
];
