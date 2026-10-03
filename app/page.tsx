import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Landmark, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { fetchCardArticles, fetchAdSlot, toCardArticle } from '@/lib/articles';
import type { CardArticle } from '@/components/cards/NewsCard';
import NewsCard from '@/components/cards/NewsCard';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import AdSlot from '@/components/ads/AdSlot';
import SubscribeForm from '@/components/newsletter/SubscribeForm';
import TrendingList from '@/components/sections/TrendingList';
import LatestNewsFeed from '@/components/sections/LatestNewsFeed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Web3 Pakistan — Pakistan's Web3 & Crypto Intelligence Hub",
  description:
    'Stay updated with the latest developments in blockchain, cryptocurrency, Web3, markets, and crypto regulation in Pakistan.',
};

export default async function HomePage() {
  const [{ articles: featured }, trendingRows, ad] = await Promise.all([
    fetchCardArticles({ featured: true, take: 7 }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 6,
      include: { category: true, author: true },
    }),
    fetchAdSlot('home-top'),
  ]);

  const trending = (trendingRows as unknown[])
    .map(toCardArticle)
    .filter((a): a is CardArticle => a !== null);

  const [hero, ...rest] = featured;
  const secondary = rest.slice(0, 2);
  const small = rest.slice(2, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdSlot slot="home-top" html={ad.html} active={ad.active} />

      {/* Hero / masthead */}
      <section
        aria-label="Welcome to Web3 Pakistan"
        className="relative mt-2 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-zinc-900 to-black px-6 py-12 sm:px-10 sm:py-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl"
        />
        <p className="relative inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
          <Sparkles className="h-4 w-4" aria-hidden />
          News · Markets · Regulation
        </p>
        <h1 className="relative mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl">
          Pakistan&apos;s Web3 &amp; Crypto <span className="text-accent">Intelligence Hub</span>
        </h1>
        <p className="relative mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Stay updated with the latest developments in blockchain, cryptocurrency, Web3, markets,
          and crypto regulation in Pakistan.
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-300"
          >
            Explore Latest News
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/regulation"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-accent hover:text-accent"
          >
            <Landmark className="h-4 w-4" aria-hidden />
            Pakistan Crypto Regulation
          </Link>
        </div>
      </section>

      {/* Featured stories */}
      {featured.length > 0 && (
        <section className="mt-12" aria-label="Featured stories">
          <SectionHeader title="Featured Stories" href="/news" />
          <div className="grid gap-5 lg:grid-cols-3">
            {hero && (
              <div className="lg:col-span-2">
                <NewsCard article={hero} variant="large" />
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {secondary.map((article) => (
                <NewsCard key={article.id} article={article} variant="medium" />
              ))}
            </div>
          </div>
          {small.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {small.map((article) => (
                <NewsCard key={article.id} article={article} variant="small" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Latest news + sidebar */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <section aria-label="Latest news">
          <SectionHeader title="Latest News" href="/news" />
          <LatestNewsFeed />
        </section>

        <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <TrendingList articles={trending} />
          <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-zinc-900 p-6">
            <h2 className="text-lg font-bold tracking-tight text-zinc-100">
              The Web3 Pakistan <span className="text-accent">Daily Brief</span>
            </h2>
            <p className="mt-2 text-sm text-muted">
              The five stories that matter, in under three minutes — every morning. Free, no spam.
            </p>
            <div className="mt-4">
              <SubscribeForm compact />
            </div>
          </div>
        </div>
      </div>

      {/* Empty state when nothing published at all */}
      {featured.length === 0 && (
        <div className="mt-12">
          <EmptyState
            title="Welcome to Web3 Pakistan"
            message="Pakistan's Web3 & Crypto Intelligence Hub. Our editors are preparing the first stories — check back soon."
          />
        </div>
      )}
    </div>
  );
}
