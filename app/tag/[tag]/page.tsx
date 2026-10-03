import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { toCardArticle } from '@/lib/articles';
import type { CardArticle } from '@/components/cards/NewsCard';
import NewsCard from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

interface TagPageProps {
  params: { tag: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = await prisma.tag.findUnique({ where: { slug: params.tag } });
  const name = tag?.name ?? params.tag;
  return {
    title: tag ? `Stories tagged "${name}"` : 'Tag not found',
    description: tag
      ? `All Web3 Pakistan stories tagged "${name}".`
      : 'The requested tag does not exist.',
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = await prisma.tag.findUnique({ where: { slug: params.tag } });
  if (!tag) notFound();

  const rows = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      articleTags: { some: { tagId: tag.id } },
    },
    orderBy: { publishedAt: 'desc' },
    include: { category: true, author: true },
  });

  const articles = (rows as unknown[])
    .map(toCardArticle)
    .filter((a): a is CardArticle => a !== null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Tag</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          #{tag.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {articles.length === 0
            ? 'No stories with this tag yet.'
            : `${articles.length} ${articles.length === 1 ? 'story' : 'stories'} tagged “${tag.name}”.`}
        </p>
      </header>

      {articles.length === 0 ? (
        <EmptyState
          title="No stories with this tag yet"
          message="Our editors haven't filed anything under this tag. Check back soon."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} variant="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
