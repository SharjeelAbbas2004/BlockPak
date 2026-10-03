'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import NewsCard, { type CardArticle } from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import { ARTICLE_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface ArticlesResponse {
  articles: CardArticle[];
  totalPages: number;
}

/**
 * Client-side "Latest News" feed for the homepage.
 * Filters via GET /api/articles?category=<slug>&page=<n>&status=published
 * and appends pages with "Load More". Fails soft via EmptyState.
 */
export default function LatestNewsFeed() {
  const [category, setCategory] = useState('');
  const [articles, setArticles] = useState<CardArticle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);

  const fetchPage = useCallback(async (cat: string, p: number): Promise<ArticlesResponse | null> => {
    try {
      const params = new URLSearchParams({ page: String(p), status: 'published' });
      if (cat) params.set('category', cat);
      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) return null;
      const data = (await res.json()) as Partial<ArticlesResponse>;
      if (!Array.isArray(data.articles)) return null;
      return {
        articles: data.articles,
        totalPages: typeof data.totalPages === 'number' && data.totalPages > 0 ? data.totalPages : 1,
      };
    } catch {
      return null;
    }
  }, []);

  // Initial load + category changes (resets pagination).
  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setFailed(false);
    setArticles([]);
    setPage(1);
    fetchPage(category, 1).then((result) => {
      if (id !== requestId.current) return;
      setLoading(false);
      if (!result) {
        setFailed(true);
        return;
      }
      setArticles(result.articles);
      setTotalPages(result.totalPages);
    });
  }, [category, fetchPage]);

  async function loadMore() {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setLoadingMore(true);
    const result = await fetchPage(category, next);
    setLoadingMore(false);
    if (!result) {
      setFailed(true);
      return;
    }
    const seen = new Set(articles.map((a) => a.id));
    setArticles((prev) => [
      ...prev,
      ...result.articles.filter((a) => !seen.has(a.id)),
    ]);
    setPage(next);
    setTotalPages(result.totalPages);
  }

  return (
    <div>
      {/* Filter chips */}
      <div
        role="group"
        aria-label="Filter by category"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        <button
          type="button"
          onClick={() => setCategory('')}
          aria-pressed={category === ''}
          className={cn(
            'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            category === ''
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-muted hover:border-accent/60 hover:text-zinc-200',
          )}
        >
          All
        </button>
        {ARTICLE_CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug)}
            aria-pressed={category === c.slug}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              category === c.slug
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-muted hover:border-accent/60 hover:text-zinc-200',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2" aria-label="Loading stories">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-surface p-4">
                <div className="aspect-[16/10] rounded-lg bg-zinc-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-zinc-800" />
                <div className="mt-2 h-4 w-1/2 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : failed ? (
          <EmptyState
            title="Couldn't load the latest news"
            message="Something went wrong while fetching stories. Please check your connection and try again."
          />
        ) : articles.length === 0 ? (
          <EmptyState
            title="No stories yet"
            message="Nothing published in this section yet — our editors are on it."
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} variant="medium" />
              ))}
            </div>
            {page < totalPages && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingMore ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
