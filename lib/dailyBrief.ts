import { prisma } from './prisma';
import type { RegulationStatus } from '@prisma/client';
import type { SourceLabel } from '@/components/ui/SourceLabelBadge';

const SOURCE_LABELS: SourceLabel[] = [
  'OFFICIAL_SOURCE',
  'NEWS_REPORT',
  'ANALYSIS',
  'OPINION',
  'EDUCATIONAL',
];

function toSourceLabel(raw: unknown): SourceLabel {
  return typeof raw === 'string' && (SOURCE_LABELS as string[]).includes(raw)
    ? (raw as SourceLabel)
    : 'NEWS_REPORT';
}

export interface BriefStory {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: string; // ISO
  sourceLabel: SourceLabel;
}

export interface BriefRegulation {
  id: string;
  slug: string;
  title: string;
  status: RegulationStatus;
  institution: string | null;
  isDemo: boolean;
  updatedAt: string; // ISO
}

export interface BriefMarket {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
}

export interface DailyBrief {
  date: string; // ISO
  todayIn60Seconds: BriefStory[];
  pakistan: BriefStory[];
  global: BriefStory[];
  regulation: BriefRegulation[];
  markets: { movers: BriefMarket[] };
  watch: string[];
  watchSource: 'site-setting' | 'curated';
}

const PUBLISHED_WHERE = {
  status: 'PUBLISHED' as const,
  publishedAt: { not: null, lte: new Date() },
};

function toBriefStory(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  sourceLabel: unknown;
  publishedAt: Date | null;
  category: { name: string; slug: string };
}): BriefStory {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.excerpt.length > 220 ? `${row.excerpt.slice(0, 217).trimEnd()}…` : row.excerpt,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
    sourceLabel: toSourceLabel(row.sourceLabel),
  };
}

/** Curated standing watchlist — editorial, not news. Used when no site setting exists. */
const CURATED_WATCH: string[] = [
  'PVARA licensing portal: any new licence categories, application windows, or published licensee lists.',
  'State Bank of Pakistan circulars affecting banking access for PVARA-licensed virtual asset service providers.',
  'Parliamentary or committee activity connected to the Virtual Assets Act, 2026.',
  'Official PVARA enforcement actions, advisories, or investor warnings.',
];

async function resolveWatch(): Promise<{ watch: string[]; watchSource: 'site-setting' | 'curated' }> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'dailyBrief.watch' } });
  if (setting) {
    try {
      const parsed: unknown = JSON.parse(setting.value);
      if (Array.isArray(parsed)) {
        const items = parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
        if (items.length > 0) return { watch: items, watchSource: 'site-setting' };
      }
    } catch {
      // Malformed JSON — fall through to the curated list.
    }
  }
  return { watch: CURATED_WATCH, watchSource: 'curated' };
}

export async function buildDailyBrief(): Promise<DailyBrief> {
  const [topStories, pakistan, global, regulations, marketData, { watch, watchSource }] = await Promise.all([
    prisma.article.findMany({
      where: PUBLISHED_WHERE,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        sourceLabel: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: { ...PUBLISHED_WHERE, category: { slug: 'pakistan' } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        sourceLabel: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: { ...PUBLISHED_WHERE, category: { slug: { notIn: ['pakistan', 'regulation'] } } },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        sourceLabel: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.regulation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 4,
      select: { id: true, slug: true, title: true, status: true, institution: true, isDemo: true, updatedAt: true },
    }),
    prisma.marketData.findMany({
      select: { symbol: true, name: true, priceUsd: true, change24h: true },
    }),
    resolveWatch(),
  ]);

  const movers: BriefMarket[] = marketData
    .slice()
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 6)
    .map((m) => ({ symbol: m.symbol, name: m.name, priceUsd: m.priceUsd, change24h: m.change24h }));

  return {
    date: new Date().toISOString(),
    todayIn60Seconds: topStories.map(toBriefStory),
    pakistan: pakistan.map(toBriefStory),
    global: global.map(toBriefStory),
    regulation: regulations.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      institution: r.institution,
      isDemo: r.isDemo,
      updatedAt: r.updatedAt.toISOString(),
    })),
    markets: { movers },
    watch,
    watchSource,
  };
}
