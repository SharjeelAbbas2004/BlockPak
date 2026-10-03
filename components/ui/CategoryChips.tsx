'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ARTICLE_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  /** Path to push to, e.g. "/news". Query params are preserved except page, which resets. */
  basePath: string;
  paramName?: string;
}

/** URL-driven category filter chips (server-side filtering + pagination). */
export default function CategoryChips({ basePath, paramName = 'category' }: CategoryChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get(paramName) ?? '';

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set(paramName, slug);
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const chip = (slug: string, label: string) => (
    <button
      key={slug || 'all'}
      type="button"
      onClick={() => select(slug)}
      aria-pressed={active === slug}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active === slug
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-muted hover:border-accent/60 hover:text-zinc-200',
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {chip('', 'All')}
      {ARTICLE_CATEGORIES.map((c) => chip(c.slug, c.name))}
    </div>
  );
}
