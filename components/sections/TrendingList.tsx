import Link from 'next/link';
import { Flame } from 'lucide-react';
import type { CardArticle } from '@/components/cards/NewsCard';
import { cn, formatDate } from '@/lib/utils';

interface TrendingListProps {
  articles: CardArticle[];
}

/** Numbered "most read" sidebar list. Server-rendered. */
export default function TrendingList({ articles }: TrendingListProps) {
  if (articles.length === 0) return null;

  return (
    <aside aria-label="Trending on Web3 Pakistan" className="rounded-xl border border-border bg-surface p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-100">
        <Flame className="h-5 w-5 text-accent" aria-hidden />
        Trending on Web3 Pakistan
      </h2>
      <ol className="mt-5 space-y-5">
        {articles.map((article, i) => (
          <li key={article.id} className="flex gap-3">
            <span
              aria-hidden
              className={cn(
                'w-7 shrink-0 text-2xl font-extrabold leading-none tabular-nums',
                i === 0 ? 'text-accent' : 'text-zinc-700',
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <Link
                href={`/news/${article.slug}`}
                className="clamp-2 block text-sm font-semibold leading-snug text-zinc-100 transition-colors hover:text-accent"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {article.category.name} · {formatDate(article.publishedAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
