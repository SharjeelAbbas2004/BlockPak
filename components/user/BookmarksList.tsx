'use client';

import { useState } from 'react';
import { BookmarkX, Loader2 } from 'lucide-react';
import NewsCard, { type CardArticle } from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';

export interface SavedArticle extends CardArticle {
  savedAt: string;
}

export default function BookmarksList({ initial }: { initial: SavedArticle[] }) {
  const [articles, setArticles] = useState<SavedArticle[]>(initial);
  const [removing, setRemoving] = useState<string | null>(null);

  async function remove(articleId: string) {
    if (removing) return;
    setRemoving(articleId);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error('failed');
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch {
      // Keep the article in the list; the user can retry.
    } finally {
      setRemoving(null);
    }
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        title="No saved articles yet"
        message="Tap the Save button on any story to keep it here for later."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {articles.map((article) => (
        <div key={article.id} className="relative">
          <NewsCard article={article} variant="medium" />
          <button
            type="button"
            onClick={() => remove(article.id)}
            disabled={removing === article.id}
            aria-label={`Remove "${article.title}" from bookmarks`}
            title="Remove bookmark"
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-black/70 px-2.5 py-1.5 text-xs font-medium text-red-300 backdrop-blur transition-colors hover:bg-red-500/20 disabled:opacity-60"
          >
            {removing === article.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BookmarkX className="h-3.5 w-3.5" />
            )}
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
