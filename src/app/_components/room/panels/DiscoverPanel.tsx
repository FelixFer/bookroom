"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";
import { Button } from "@/app/_components/Button";
import { LoaderOverlay } from "@/app/_components/Loader";

type OpenLibBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

export const DiscoverPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenLibBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track per-book state: "idle" | "adding" | "added" | "owned"
  const [bookState, setBookState] = useState<Record<string, "adding" | "added" | "owned">>({});

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    setResults([]);
    setBookState({});
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=12&fields=key,title,author_name,cover_i,first_publish_year`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as { docs: OpenLibBook[] };
      setResults(data.docs ?? []);
    } catch {
      setError("Could not reach Open Csollection. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (book: OpenLibBook) => {
    setBookState((prev) => ({ ...prev, [book.key]: "adding" }));
    try {
      await postJson("/api/books", {
        title: book.title,
        author: book.author_name?.[0] ?? null,
        coverUrl: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        status: "PLAN_TO_READ",
      });
      setBookState((prev) => ({ ...prev, [book.key]: "added" }));
    } catch (err: unknown) {
      // 409 = already in collection
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setBookState((prev) => ({ ...prev, [book.key]: "owned" }));
      } else {
        setBookState((prev) => {
          const next = { ...prev };
          delete next[book.key];
          return next;
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <form className="flex gap-2" onSubmit={search}>
        <input
          className="form-input flex-1 text-sm"
          placeholder="Search by title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="primary" loading={loading}>
          Search
        </Button>
      </form>
      {loading && <LoaderOverlay />}

      {error && <p className="form-error text-xs">{error}</p>}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 pt-6 text-center">
          <span className="text-4xl">🔍</span>
          <p className="form-help text-xs">
            Search millions of books from Open Library.
            <br />
            Find one and add it to your collection instantly.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="form-help text-center text-xs">Searching Open Library…</p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {results.map((book) => {
            const state = bookState[book.key];
            const coverUrl = book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : null;

            return (
              <div
                key={book.key}
                className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                {/* Cover */}
                <div className="flex h-32 items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📖</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-2">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                    {book.title}
                  </p>
                  {book.author_name?.[0] && (
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {book.author_name[0]}
                    </p>
                  )}
                  {book.first_publish_year && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">
                      {book.first_publish_year}
                    </p>
                  )}

                  {/* Add button */}
                  <button
                    className={`mt-auto w-full rounded px-2 py-1 text-xs font-medium transition-colors ${state === "added"
                      ? "cursor-default bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : state === "owned"
                        ? "cursor-default bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                        : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      }`}
                    onClick={() => !state && addBook(book)}
                    disabled={!!state}
                  >
                    {state === "adding"
                      ? "Adding…"
                      : state === "added"
                        ? "✓ Added"
                        : state === "owned"
                          ? "Already in collection"
                          : "＋ Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
