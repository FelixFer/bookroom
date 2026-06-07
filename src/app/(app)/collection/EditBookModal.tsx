"use client";

import { useEffect, useState } from "react";
import { postJson, patchJson, getJson } from "@/lib/api";
import type { UserBookItem } from "@/types/book";
import { STATUS_LABELS, STATUS_ORDER } from "@/types/book";
import { Button } from "@/app/_components/Button";
import { LoaderOverlay } from "@/app/_components/Loader";
import { TBookMark } from "@/app/_components/room/panels/BookmarkPanel";

type Props = {
  book: UserBookItem | "new" | null; // null = closed, "new" = create mode
  onClose: () => void;
  onSaved: (book: UserBookItem) => void;
};

export const EditBookModal = ({ book, onClose, onSaved }: Props) => {
  const isNew = book === "new";
  const isEdit = book !== null && book !== "new";
  const open = book !== null;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState<string>("PLAN_TO_READ");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [bookmark, setBookmark] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill when opening in edit mode
  useEffect(() => {
    if (isEdit) {
      setTitle(book.title);
      setAuthor(book.author ?? "");
      setCoverUrl(book.coverUrl ?? "");
      setStatus(book.status);
      setRating(book.rating);
      setNotes(book.notes ?? "");
      setFavorite(book.favorite);
    } else {
      setTitle("");
      setAuthor("");
      setCoverUrl("");
      setStatus("PLAN_TO_READ");
      setRating(null);
      setNotes("");
      setFavorite(false);
    }
    setError(null);
  }, [book, isEdit]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    getJson<{ data: TBookMark[] }>("/api/room/bookmarks?labeled=true")
      .then(res => setBookmarks(res.data))
      .catch(console.error);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      let result: UserBookItem;
      if (isNew) {
        result = await postJson<UserBookItem>("/api/books", {
          title: title.trim(),
          author: author.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          status,
          bookmark,
        });
      } else {
        result = await patchJson<UserBookItem>(`/api/books/${book.id}`, {
          status,
          rating,
          notes: notes.trim() || null,
          favorite,
          bookmark,
        });
      }
      onSaved(result);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {isNew ? "ADD BOOK" : "EDIT BOOK"}
          </h2>
          <Button variant="icon" onClick={onClose} aria-label="Close">✕</Button>
        </div>

        {/* Body */}
        <form
          className="flex flex-col gap-4 overflow-y-auto p-5"
          onSubmit={handleSubmit}
        >
          <label className="form-label">
            <p>Title <span className="text-red-500">*</span></p>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isEdit}
              placeholder="e.g. The Hobbit"
              required
            />
          </label>

          {isNew && (
            <>
              <label className="form-label">
                Author
                <input
                  className="form-input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. J.R.R. Tolkien"
                />
              </label>
              <label className="form-label">
                Cover URL
                <input
                  className="form-input"
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
            </>
          )}

          <label className="form-label">
            Status
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Bookmark
            <select
              className="form-input"
              value={bookmark ?? ""}
              onChange={(e) => setBookmark(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— No tag —</option>
              {bookmarks.map((b, i) => (
                <option key={i} value={b.slot}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>

          {isEdit && (
            <>
              {/* Star rating */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Rating
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="text-xl leading-none"
                      onClick={() =>
                        setRating(rating === n ? null : n)
                      }
                      aria-label={`${n} star`}
                    >
                      {n <= (rating ?? 0) ? "★" : "☆"}
                    </button>
                  ))}
                  {rating && (
                    <button
                      type="button"
                      className="ml-2 text-xs text-zinc-400 underline"
                      onClick={() => setRating(null)}
                    >
                      clear
                    </button>
                  )}
                </div>
              </div>

              <label className="form-label">
                Notes
                <textarea
                  className="form-input min-h-20 resize-y"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Your thoughts…"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                Mark as favourite ⭐
              </label>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" variant="primary" loading={loading} className="flex-1">
              {isNew ? "Add book" : "Save changes"}
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
          {loading && <LoaderOverlay />}
        </form>
      </div>
    </>
  );
};
