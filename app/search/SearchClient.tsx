'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, RotateCcw, Search as SearchIcon } from 'lucide-react';
import NewsCard, { type CardArticle } from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import { ARTICLE_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

type SortKey = 'relevance' | 'newest' | 'oldest';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none';

/** Full search UI: keyword + sort + category + date range, backed by /api/search. */
export default function SearchClient() {
  const initialQ = useSearchParams().get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState<CardArticle[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      setFailed(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setFailed(false);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: q.trim(),
          sort,
          limit: '24',
        });
        if (category) params.set('category', category);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const res = await fetch(`/api/search?${params.toString()}`);
        if (id !== requestId.current) return;
        if (!res.ok) throw new Error('search failed');
        const data = (await res.json()) as { results?: CardArticle[] };
        setResults(Array.isArray(data.results) ? data.results : []);
        setSearched(true);
        setLoading(false);
      } catch {
        if (id !== requestId.current) return;
        setFailed(true);
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [q, sort, category, from, to]);

  function clearFilters() {
    setSort('relevance');
    setCategory('');
    setFrom('');
    setTo('');
  }

  const hasFilters = sort !== 'relevance' || category !== '' || from !== '' || to !== '';

  return (
    <div>
      {/* Search controls */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <label className="block">
          <span className="sr-only">Search stories</span>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stories… (e.g. bitcoin, SBP, DeFi)"
              className={cn(inputClass, 'pl-11')}
              aria-label="Search stories"
            />
          </div>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={inputClass}
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Section
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              aria-label="Filter by section"
            >
              <option value="">All sections</option>
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              From
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputClass}
              aria-label="Published from date"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              To
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputClass}
              aria-label="Published to date"
            />
          </label>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-cyan-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Searching…
          </p>
        )}

        {!loading && q.trim().length < 2 && (
          <EmptyState
            title="Start typing to search"
            message="Type at least 2 characters to search every published story on Web3 Pakistan."
          />
        )}

        {!loading && failed && (
          <EmptyState
            title="Search unavailable"
            message="Something went wrong while searching. Please check your connection and try again."
          />
        )}

        {!loading && !failed && searched && results.length === 0 && (
          <EmptyState
            title="No results"
            message="Nothing matched your search. Try different keywords, widen the date range, or clear the section filter."
          />
        )}

        {!loading && !failed && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted" aria-live="polite">
              {results.length} result{results.length === 1 ? '' : 's'} for “{q.trim()}”
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((article) => (
                <NewsCard key={article.id} article={article} variant="medium" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
