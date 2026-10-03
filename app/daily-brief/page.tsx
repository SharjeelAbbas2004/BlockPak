import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, Eye, Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { buildDailyBrief, type BriefStory } from '@/lib/dailyBrief';
import { cn, formatDate } from '@/lib/utils';
import NewsCard, { type CardArticle } from '@/components/cards/NewsCard';
import SectionHeader from '@/components/ui/SectionHeader';
import RegulationStatusBadge from '@/components/ui/RegulationStatusBadge';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Daily Brief',
  description:
    'The Web3 Pakistan Daily Brief — the day in 60 seconds, Pakistan, global crypto, regulation, markets, and what to watch.',
};

function storyToCard(story: BriefStory): CardArticle {
  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.summary,
    imageUrl: null,
    category: { name: story.categoryName, slug: story.categorySlug },
    author: { name: 'Web3 Pakistan' },
    publishedAt: story.publishedAt,
    readingMinutes: 2,
    sourceLabel: story.sourceLabel,
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price < 10 ? 4 : 2,
  }).format(price);
}

export default async function DailyBriefPage() {
  const brief = await buildDailyBrief();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="inline-block h-8 w-1.5 rounded-full bg-accent" aria-hidden />
          Web3 Pakistan Daily Brief
        </h1>
        <p className="mt-3 flex items-center gap-2 text-muted">
          <CalendarDays className="h-4 w-4" />
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
          <span aria-hidden>·</span>
          <span>Your one-page catch-up on crypto, from Pakistan to the world.</span>
        </p>
      </header>

      {/* Today in 60 seconds */}
      <section aria-label="Today in 60 seconds">
        <SectionHeader title="Today in 60 Seconds" />
        {brief.todayIn60Seconds.length === 0 ? (
          <p className="text-sm text-muted">No stories yet today — check back soon.</p>
        ) : (
          <ol className="space-y-4">
            {brief.todayIn60Seconds.map((story, i) => (
              <li
                key={story.id}
                className="flex gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-extrabold text-accent"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <Link href={`/news/${story.slug}`}>
                    <h2 className="text-base font-bold leading-snug text-zinc-100 transition-colors hover:text-accent sm:text-lg">
                      {story.title}
                    </h2>
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{story.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Pakistan */}
      <section className="mt-12" aria-label="Pakistan">
        <SectionHeader title="Pakistan" href="/pakistan" linkLabel="Pakistan hub" />
        {brief.pakistan.length === 0 ? (
          <p className="text-sm text-muted">No Pakistan stories in the brief today.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {brief.pakistan.map((story) => (
              <NewsCard key={story.id} article={storyToCard(story)} variant="small" />
            ))}
          </div>
        )}
      </section>

      {/* Global crypto */}
      <section className="mt-12" aria-label="Global crypto">
        <SectionHeader title="Global Crypto" href="/crypto" linkLabel="Crypto section" />
        {brief.global.length === 0 ? (
          <p className="text-sm text-muted">No global stories in the brief today.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brief.global.slice(0, 3).map((story) => (
              <NewsCard key={story.id} article={storyToCard(story)} variant="medium" />
            ))}
          </div>
        )}
      </section>

      {/* Regulation */}
      <section className="mt-12" aria-label="Regulation">
        <SectionHeader title="Regulation" href="/regulation" linkLabel="Regulation tracker" />
        {brief.regulation.length === 0 ? (
          <p className="text-sm text-muted">No regulation updates tracked yet.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {brief.regulation.map((reg) => (
              <li key={reg.id}>
                <Link
                  href={`/regulation/${reg.slug}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 transition-colors hover:bg-zinc-900/60 sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Landmark className="h-4 w-4 shrink-0 text-accent" />
                    <span className="truncate text-sm font-semibold text-zinc-100">
                      {reg.title}
                    </span>
                    {reg.isDemo && (
                      <span className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                        Sample
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    {reg.institution && (
                      <span className="hidden text-xs text-muted sm:inline">{reg.institution}</span>
                    )}
                    <RegulationStatusBadge status={reg.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Markets */}
      <section className="mt-12" aria-label="Markets">
        <SectionHeader title="Markets — Top Movers" />
        {brief.markets.movers.length === 0 ? (
          <p className="text-sm text-muted">Market data unavailable right now.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[420px] border-collapse bg-surface text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Asset</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">24h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brief.markets.movers.map((m) => {
                  const up = m.change24h >= 0;
                  return (
                    <tr key={m.symbol} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <span className="font-bold text-zinc-100">{m.symbol}</span>{' '}
                        <span className="text-muted">{m.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-200">
                        {formatPrice(m.priceUsd)}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right font-semibold',
                          up ? 'text-emerald-400' : 'text-red-400',
                        )}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {up ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {up ? '+' : ''}
                          {m.change24h.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-muted">
          Market data may be delayed or approximate. Not investment advice.
        </p>
      </section>

      {/* What to watch */}
      <section className="mt-12" aria-label="What to watch">
        <SectionHeader title="What to Watch" />
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Eye className="h-4 w-4 text-accent" />
            {brief.watchSource === 'site-setting'
              ? 'Set by our editors'
              : 'Curated watchlist — standing items our editors track'}
          </p>
          <ul className="space-y-3">
            {brief.watch.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-zinc-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {brief.todayIn60Seconds.length === 0 &&
        brief.pakistan.length === 0 &&
        brief.global.length === 0 && (
          <div className="mt-12">
            <EmptyState
              title="The brief is empty today"
              message="No published stories or market data are available yet. Check back soon."
            />
          </div>
        )}
    </div>
  );
}
