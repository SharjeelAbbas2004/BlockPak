'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setError(false);
      setSearched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [open ]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleChange(value: string) {
    setQuery(value);
    setError(false);
    if (timer.current) clearTimeout(timer.current);

    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setError(true);
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 350);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search news, guides, regulation…"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-muted focus:outline-none"
            aria-label="Search query"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:text-zinc-100"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {error ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Search is temporarily unavailable. Please try again later.
            </p>
          ) : !searched && results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Type at least 2 characters to search across Web3 Pakistan.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No results found for “{query.trim()}”. Try different keywords.
            </p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/news/${r.slug}`}
                    onClick={onClose}
                    className="block rounded-lg px-4 py-3 transition-colors hover:bg-zinc-800/60"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {r.category}
                    </p>
                    <p className="mt-0.5 font-medium text-zinc-100">{r.title}</p>
                    <p className="clamp-2 mt-1 text-sm text-muted">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
