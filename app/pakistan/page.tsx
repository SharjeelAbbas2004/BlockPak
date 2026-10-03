import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { toCardArticle } from '@/lib/articles';
import NewsCard, { type CardArticle } from '@/components/cards/NewsCard';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "What's Happening in Pakistan?",
  description:
    'Web3 in Pakistan — exchanges, banks & fintech, startups, and crypto education, reported with clearly labeled sources.',
};

const EXCHANGE_TAGS = new Set(['binance', 'exchange', 'exchanges']);
const BANK_FINTECH_TAGS = new Set(['sbp', 'banking', 'fintech', 'banks']);
const STARTUP_TAGS = new Set(['startup', 'startups']);

interface PakistanArticleRow extends CardArticle {
  tagSlugs: string[];
  sourceLabelRaw: string;
}

function SectionGrid({ articles }: { articles: CardArticle[] }) {
  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
        No stories in this section yet — our editors are on it.
      </p>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.slice(0, 6).map((article) => (
        <NewsCard key={article.id} article={article} variant="medium" />
      ))}
    </div>
  );
}

export default async function PakistanPage() {
  const rows = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { not: null, lte: new Date() },
      category: { slug: 'pakistan' },
    },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
      readingMinutes: true,
      sourceLabel: true,
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      articleTags: { select: { tag: { select: { slug: true } } } },
    },
  });

  const articles: PakistanArticleRow[] = rows.flatMap((row) => {
    const card = toCardArticle(row);
    if (!card) return [];
    return [
      {
        ...card,
        tagSlugs: row.articleTags.map((at) => at.tag.slug),
        sourceLabelRaw: String(row.sourceLabel),
      },
    ];
  });

  const inTags = (article: PakistanArticleRow, tags: Set<string>) =>
    article.tagSlugs.some((slug) => tags.has(slug));

  const exchanges = articles.filter((a) => inTags(a, EXCHANGE_TAGS));
  const banksFintech = articles.filter((a) => inTags(a, BANK_FINTECH_TAGS));
  const startups = articles.filter((a) => inTags(a, STARTUP_TAGS));
  const education = articles.filter((a) => a.sourceLabelRaw === 'EDUCATIONAL');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="inline-block h-8 w-1.5 rounded-full bg-accent" aria-hidden />
          What&apos;s Happening in Pakistan?
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          The latest on Pakistan&apos;s Web3 scene — exchanges serving local users, banks and
          fintech, homegrown startups, and plain-language crypto education. Every story carries a
          source label so you know what you&apos;re reading.
        </p>
      </header>

      {articles.length === 0 ? (
        <EmptyState
          title="No Pakistan stories yet"
          message="Our editors are covering the local Web3 beat. Check back soon — or browse the latest news across all sections."
        />
      ) : (
        <>
          {/* Timeline of latest Pakistan stories */}
          <section aria-label="Latest Pakistan stories">
            <SectionHeader title="Latest in Pakistan" href="/news" linkLabel="All news" />
            <ol className="relative space-y-6 border-l-2 border-border pl-6 sm:pl-10">
              {articles.slice(0, 8).map((article) => (
                <li key={article.id} className="relative">
                  <span
                    className="absolute -left-[32px] top-2 h-4 w-4 rounded-full bg-accent ring-4 ring-bg sm:-left-[48px]"
                    aria-hidden
                  />
                  <div>
                    <time
                      dateTime={new Date(article.publishedAt).toISOString()}
                      className="mb-2 inline-block rounded-full border border-border bg-zinc-900 px-3 py-1 text-xs font-semibold text-muted"
                    >
                      {formatDate(article.publishedAt)}
                    </time>
                    <NewsCard article={article} variant="small" />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Ecosystem sections */}
          <section className="mt-14" aria-label="Exchanges">
            <SectionHeader title="Exchanges" />
            <SectionGrid articles={exchanges} />
          </section>

          <section className="mt-14" aria-label="Banks and fintech">
            <SectionHeader title="Banks & Fintech" />
            <SectionGrid articles={banksFintech} />
          </section>

          <section className="mt-14" aria-label="Startups">
            <SectionHeader title="Startups" />
            <SectionGrid articles={startups} />
          </section>

          <section className="mt-14" aria-label="Education">
            <SectionHeader title="Education" />
            <SectionGrid articles={education} />
          </section>
        </>
      )}
    </div>
  );
}
