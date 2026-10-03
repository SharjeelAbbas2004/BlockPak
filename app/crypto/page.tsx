import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { toCardArticle } from '@/lib/articles';
import {
  getBtcDominance,
  getMarketOverview,
  getTotalMarketCap,
  type MarketCoin,
} from '@/lib/services/market';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import MarketChart from '@/components/charts/MarketChart';
import NewsCard, { type CardArticle } from '@/components/cards/NewsCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Crypto Markets',
  description:
    'Crypto market dashboard (demo data) plus educational explainers on Bitcoin, Ethereum, stablecoins, exchanges, wallets, and crypto security — Web3 Pakistan.',
};

const DISCLAIMER =
  'Web3 Pakistan provides educational and informational content about blockchain, cryptocurrency and digital assets. Nothing on this website constitutes financial, investment, legal or tax advice. Cryptocurrency and digital assets involve significant risks.';

/* ---------------- data helpers ---------------- */

interface CoinRow {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  marketCap: number | null;
  volume24h: number | null;
  sparkline: number[];
}

function toSparkline(v: unknown): number[] {
  if (Array.isArray(v) && v.every((x): x is number => typeof x === 'number')) return v;
  return [];
}

function mockToRow(c: MarketCoin): CoinRow {
  return {
    symbol: c.symbol,
    name: c.name,
    priceUsd: c.price,
    change24h: c.change24h,
    marketCap: null,
    volume24h: null,
    sparkline: c.sparkline,
  };
}

/** Load market snapshot: prefer MarketData DB rows, fall back to the market service (mock). */
async function loadCoins(): Promise<{ coins: CoinRow[]; isDemo: boolean }> {
  try {
    const rows = await prisma.marketData.findMany();
    if (rows.length > 0) {
      return {
        isDemo: true, // seeded rows are sample data, not live prices
        coins: rows.map((r) => ({
          symbol: r.symbol,
          name: r.name,
          priceUsd: r.priceUsd,
          change24h: r.change24h,
          marketCap: r.marketCap,
          volume24h: r.volume24h,
          sparkline: toSparkline(r.sparkline),
        })),
      };
    }
  } catch {
    // DB unavailable — fall through to the mock service
  }
  const mock = await getMarketOverview();
  return { isDemo: true, coins: mock.map(mockToRow) };
}

async function fetchByTag(tagSlug: string): Promise<CardArticle[]> {
  try {
    const rows = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        articleTags: { some: { tag: { slug: tagSlug } } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { category: true, author: true },
    });
    return rows.map(toCardArticle).filter((a): a is CardArticle => a !== null);
  } catch {
    return [];
  }
}

/* ---------------- formatting ---------------- */

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 10 ? 2 : 0,
  }).format(n);
}

function formatCompactUsd(n: number): string {
  return (
    '$' +
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
  );
}

function formatPct(n: number): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
}

/* ---------------- category sections ---------------- */

const SECTIONS: { title: string; tagSlug: string; description: string }[] = [
  {
    title: 'Bitcoin',
    tagSlug: 'bitcoin',
    description: 'News and explainers about Bitcoin — the first and largest cryptocurrency.',
  },
  {
    title: 'Ethereum',
    tagSlug: 'ethereum',
    description: 'Guides and news about Ethereum, smart contracts, and upgrades.',
  },
  {
    title: 'Stablecoins',
    tagSlug: 'stablecoins',
    description: 'What stablecoins are, how they work, and their role in markets.',
  },
  {
    title: 'Altcoins',
    tagSlug: 'solana',
    description: 'Other major digital assets beyond Bitcoin and Ethereum.',
  },
  {
    title: 'Exchanges',
    tagSlug: 'binance',
    description: 'How crypto exchanges work, plus exchange news relevant to Pakistan.',
  },
  {
    title: 'Wallets',
    tagSlug: 'wallets',
    description: 'Hot vs cold wallets, seed phrases, and keeping your crypto safe.',
  },
  {
    title: 'Crypto Security',
    tagSlug: 'crypto-security',
    description: 'Scam prevention, common attack vectors, and security best practices.',
  },
];

/* ---------------- page ---------------- */

export default async function CryptoPage() {
  const [{ coins }, btcDominance, totalCap] = await Promise.all([
    loadCoins(),
    getBtcDominance().catch(() => 0),
    getTotalMarketCap().catch(() => 0),
  ]);

  const bySymbol = new Map(coins.map((c) => [c.symbol, c]));
  const btc = bySymbol.get('BTC');
  const eth = bySymbol.get('ETH');

  const cappedCoins = coins.filter((c) => typeof c.marketCap === 'number' && c.marketCap !== null);
  const marketCapTotal =
    cappedCoins.length > 0
      ? cappedCoins.reduce((sum, c) => sum + (c.marketCap as number), 0)
      : totalCap;
  const volumeTotal = coins
    .filter((c) => typeof c.volume24h === 'number' && c.volume24h !== null)
    .reduce((sum, c) => sum + (c.volume24h as number), 0);

  const gainers = [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, 4);
  const losers = [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, 4);

  const sectionArticles = await Promise.all(
    SECTIONS.map(async (s) => ({ ...s, articles: await fetchByTag(s.tagSlug) })),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100 sm:text-3xl">
          Crypto Markets
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Market snapshot, 24h movers, and educational explainers — learn how Bitcoin, Ethereum,
          and digital assets work.
        </p>
      </div>

      {/* disclaimer box (verbatim) */}
      <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5">
        <p className="text-sm font-bold text-amber-200">Disclaimer</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-100/90">{DISCLAIMER}</p>
      </div>

      {/* market dashboard */}
      <section aria-labelledby="market-dashboard" className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="market-dashboard" className="text-lg font-bold text-zinc-100 sm:text-xl">
            Market Dashboard
          </h2>
          <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            Demo data — not live prices
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Snapshot figures are sample/mock data for illustration and education. Never treat them as
          real-time prices or trading signals.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          <StatCard label="BTC price" value={btc ? formatUsd(btc.priceUsd) : '—'} />
          <StatCard label="ETH price" value={eth ? formatUsd(eth.priceUsd) : '—'} />
          <StatCard
            label="Total market cap"
            value={marketCapTotal > 0 ? formatCompactUsd(marketCapTotal) : '—'}
          />
          <StatCard
            label="BTC dominance"
            value={btcDominance > 0 ? `${btcDominance.toFixed(1)}%` : '—'}
          />
          <StatCard
            label="24h volume"
            value={volumeTotal > 0 ? formatCompactUsd(volumeTotal) : '—'}
          />
        </div>
      </section>

      {/* BTC chart */}
      {btc && btc.sparkline.length >= 2 ? (
        <section aria-label="Bitcoin price chart" className="mt-6">
          <MarketChart symbol="BTC" data={btc.sparkline} />
          <p className="mt-2 text-xs text-muted">
            BTC trend over 24h (demo data).{' '}
            <span className="font-medium text-zinc-300">{formatPct(btc.change24h)}</span>{' '}
            in the last 24h — shown for illustration only.
          </p>
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Chart unavailable"
            message="Bitcoin trend data is not available right now."
          />
        </div>
      )}

      {/* gainers / losers */}
      <section aria-label="24-hour movers" className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">Top gainers</h3>
          <ul className="mt-3 divide-y divide-border">
            {gainers.map((c) => (
              <li key={c.symbol} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-bold text-zinc-100">{c.symbol}</p>
                  <p className="text-xs text-muted">{c.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-100">{formatUsd(c.priceUsd)}</p>
                  <p className="text-xs font-semibold text-green-400">{formatPct(c.change24h)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">Top losers</h3>
          <ul className="mt-3 divide-y divide-border">
            {losers.map((c) => (
              <li key={c.symbol} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-bold text-zinc-100">{c.symbol}</p>
                  <p className="text-xs text-muted">{c.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-100">{formatUsd(c.priceUsd)}</p>
                  <p className="text-xs font-semibold text-red-400">{formatPct(c.change24h)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <p className="mt-3 text-xs text-muted">
        Movers are ranked from demo data above. Past movement does not predict future prices.
      </p>

      {/* educational category sections */}
      <section aria-labelledby="learn-crypto" className="mt-10">
        <h2 id="learn-crypto" className="text-lg font-bold text-zinc-100 sm:text-xl">
          Learn Crypto <span className="font-normal text-muted">— educational content</span>
        </h2>
        <p className="mt-1 text-xs text-muted">
          Guides, explainers, and news written to teach concepts. This is education, not market
          data or investment advice.
        </p>

        <div className="mt-6 space-y-10">
          {sectionArticles.map((s) => (
            <div key={s.tagSlug}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-bold text-zinc-100 sm:text-lg">{s.title}</h3>
                <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Educational
                </span>
              </div>
              <p className="mt-1 text-xs text-muted sm:text-sm">{s.description}</p>
              {s.articles.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {s.articles.map((a) => (
                    <NewsCard key={a.id} article={a} variant="medium" />
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title={`No ${s.title} articles yet`}
                    message={`We haven't published ${s.title.toLowerCase()} articles yet. Check back soon — new educational guides are added regularly.`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* closing disclaimer */}
      <div className="mt-12 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <p className="text-xs leading-relaxed text-muted">
          {DISCLAIMER} Market figures on this page are demo data for illustration only and must not
          be used for trading decisions.
        </p>
      </div>
    </main>
  );
}
