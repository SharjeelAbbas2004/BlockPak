import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toCardArticle } from '@/lib/articles';
import type { CardArticle } from '@/components/cards/NewsCard';
import NewsCard from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import CategoryChips from '@/components/ui/CategoryChips';
import QueryPagination from '@/components/ui/QueryPagination';
import { ARTICLE_CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Latest News',
  description:
    'The latest blockchain, crypto, Web3, and regulation news from Pakistan and around the world.',
};

const PAGE_SIZE = 12;

interface NewsIndexPageProps {
  searchParams: { page?: string; category?: string };
}

export default async function NewsIndexPage({ searchParams }: NewsIndexPageProps) {
  const requestedPage = Math.max(1, Number(searchParams.page) || 1);
  const rawCategory = searchParams.category ?? '';
  const categorySlug = ARTICLE_CATEGORIES.some((c) => c.slug === rawCategory) ? rawCategory : '';

  const where: Prisma.ArticleWhereInput = { status: 'PUBLISHED' };
  if (categorySlug) where.category = { slug: categorySlug };

  const [rows, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: PAGE_SIZE,
      skip: (requestedPage - 1) * PAGE_SIZE,
      include: { category: true, author: true },
    }),
    prisma.article.count({ where }),
  ]);

  const articles = (rows as unknown[])
    .map(toCardArticle)
    .filter((a): a is CardArticle => a !== null);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
  const activeName = ARTICLE_CATEGORIES.find((c) => c.slug === categorySlug)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="inline-block h-8 w-1.5 rounded-full bg-accent" aria-hidden />
          Latest News
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every story from every desk — markets, Pakistan, regulation, blockchain, DeFi, Web3,
          and AI, in reverse chronological order.
        </p>
      </header>

      <Suspense>
        <CategoryChips basePath="/news" />
      </Suspense>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {total === 0
          ? 'No stories found.'
          : `Showing ${articles.length} of ${total} ${activeName ? `${activeName} ` : ''}stories`}
      </p>

      {articles.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={categorySlug ? `No ${activeName} stories yet` : 'No stories yet'}
            message="Our editors are working on it. Try another section, or check back soon."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} variant="medium" />
            ))}
          </div>
          <Suspense>
            <QueryPagination page={page} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  );
}
