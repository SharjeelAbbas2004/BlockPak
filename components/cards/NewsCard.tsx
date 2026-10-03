'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import SourceLabelBadge, { type SourceLabel } from '@/components/ui/SourceLabelBadge';
import BookmarkButton from '@/components/ui/BookmarkButton';

export interface CardArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: string | Date;
  readingMinutes: number;
  sourceLabel: SourceLabel;
}

interface NewsCardProps {
  article: CardArticle;
  variant?: 'large' | 'medium' | 'small';
}

function CategoryTag({ article }: { article: CardArticle }) {
  return (
    <Link
      href={`/${article.category.slug}`}
      onClick={(e) => e.stopPropagation()}
      className="text-[11px] font-bold uppercase tracking-wider text-accent hover:text-cyan-300"
    >
      {article.category.name}
    </Link>
  );
}

function Meta({ article, light = false }: { article: CardArticle; light?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 text-xs', light ? 'text-zinc-300' : 'text-muted')}>
      <span className="truncate font-medium">{article.author.name}</span>
      <span aria-hidden>·</span>
      <time dateTime={new Date(article.publishedAt).toISOString()}>{formatDate(article.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {article.readingMinutes} min
      </span>
    </div>
  );
}

export default function NewsCard({ article, variant = 'medium' }: NewsCardProps) {
  const href = `/news/${article.slug}`;

  if (variant === 'large') {
    return (
      <article className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5">
        <Link href={href} className="block">
          <div className="relative aspect-[16/9] overflow-hidden bg-zinc-800">
            {article.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-surface to-zinc-900">
                <span className="text-4xl font-extrabold tracking-tight text-zinc-700">W3P</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute left-4 top-4">
              <SourceLabelBadge label={article.sourceLabel} />
            </div>
          </div>
          <div className="p-5">
            <CategoryTag article={article} />
            <h2 className="mt-2 text-xl font-bold leading-snug text-zinc-100 transition-colors group-hover:text-accent sm:text-2xl">
              {article.title}
            </h2>
            <p className="clamp-2 mt-2 text-sm text-muted">{article.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <Meta article={article} />
              <BookmarkButton articleId={article.id} />
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'small') {
    return (
      <article className="group flex gap-3 rounded-xl border border-border bg-surface p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40">
        <Link href={href} className="flex flex-1 flex-col justify-between gap-2">
          <div>
            <CategoryTag article={article} />
            <h3 className="clamp-2 mt-1 text-sm font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-accent">
              {article.title}
            </h3>
          </div>
          <Meta article={article} />
        </Link>
        <Link href={href} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:h-24 sm:w-28">
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <span className="text-lg font-extrabold text-zinc-700">W3P</span>
            </div>
          )}
        </Link>
      </article>
    );
  }

  // medium (default)
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-zinc-800">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-surface to-zinc-900">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-700">W3P</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <SourceLabelBadge label={article.sourceLabel} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <CategoryTag article={article} />
        <Link href={href}>
          <h3 className="clamp-2 mt-1.5 text-base font-bold leading-snug text-zinc-100 transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </Link>
        <p className="clamp-2 mt-2 flex-1 text-sm text-muted">{article.excerpt}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <Meta article={article} />
          <BookmarkButton articleId={article.id} />
        </div>
      </div>
    </article>
  );
}
