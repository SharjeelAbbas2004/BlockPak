import { prisma } from './prisma';
import type { CardArticle } from '@/components/cards/NewsCard';
import type { SourceLabel } from '@/components/ui/SourceLabelBadge';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

const SOURCE_LABELS: SourceLabel[] = [
  'OFFICIAL_SOURCE',
  'NEWS_REPORT',
  'ANALYSIS',
  'OPINION',
  'EDUCATIONAL',
];

/** Narrow an unknown prisma row into a CardArticle. Returns null when unusable. */
export function toCardArticle(row: unknown): CardArticle | null {
  if (!isRecord(row)) return null;
  const category = isRecord(row.category) ? row.category : null;
  const author = isRecord(row.author) ? row.author : null;

  if (
    typeof row.id !== 'string' ||
    typeof row.slug !== 'string' ||
    typeof row.title !== 'string' ||
    typeof row.excerpt !== 'string' ||
    !category ||
    typeof category.name !== 'string' ||
    typeof category.slug !== 'string'
  ) {
    return null;
  }

  const publishedAt =
    row.publishedAt instanceof Date
      ? row.publishedAt
      : typeof row.publishedAt === 'string'
        ? row.publishedAt
        : new Date().toISOString();

  const sourceLabel =
    typeof row.sourceLabel === 'string' &&
    (SOURCE_LABELS as string[]).includes(row.sourceLabel)
      ? (row.sourceLabel as SourceLabel)
      : 'NEWS_REPORT';

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : null,
    category: { name: category.name, slug: category.slug },
    author: { name: author && typeof author.name === 'string' ? author.name : 'Web3 Pakistan' },
    publishedAt,
    readingMinutes: typeof row.readingMinutes === 'number' ? row.readingMinutes : 5,
    sourceLabel,
  };
}

export interface FullArticle extends CardArticle {
  subtitle: string | null;
  content: string;
}

function toFullArticle(row: unknown): FullArticle | null {
  const base = toCardArticle(row);
  if (!base || !isRecord(row) || typeof row.content !== 'string') return null;
  return {
    ...base,
    subtitle: typeof row.subtitle === 'string' ? row.subtitle : null,
    content: row.content,
  };
}

export interface ArticleQuery {
  categorySlug?: string;
  featured?: boolean;
  take?: number;
  skip?: number;
  excludeId?: string;
}

/** Fetch published articles as CardArticles. Fails soft → empty list. */
export async function fetchCardArticles(
  q: ArticleQuery,
): Promise<{ articles: CardArticle[]; total: number }> {
  try {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (q.categorySlug) where.category = { slug: q.categorySlug };
    if (typeof q.featured === 'boolean') where.isFeatured = q.featured;
    if (q.excludeId) where.id = { not: q.excludeId };

    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: q.take ?? 12,
        skip: q.skip ?? 0,
        include: { category: true, author: true },
      }),
      prisma.article.count({ where }),
    ]);

    const articles = (rows as unknown[])
      .map(toCardArticle)
      .filter((a): a is CardArticle => a !== null);
    return { articles, total };
  } catch {
    return { articles: [], total: 0 };
  }
}

/** Fetch a single published article by slug. Fails soft → null. */
export async function fetchArticleBySlug(slug: string): Promise<FullArticle | null> {
  try {
    const row = await prisma.article.findUnique({
      where: { slug },
      include: { category: true, author: true },
    });
    if (!row || !isRecord(row)) return null;
    if (row.status !== 'PUBLISHED') return null;
    return toFullArticle(row);
  } catch {
    return null;
  }
}

/** Fetch an active ad placement's HTML. Fails soft → inactive. */
export async function fetchAdSlot(
  slot: string,
): Promise<{ active: boolean; html: string | null }> {
  try {
    const ad = await prisma.adPlacement.findUnique({ where: { slot } });
    return { active: ad?.isActive === true, html: ad?.htmlCode ?? null };
  } catch {
    return { active: false, html: null };
  }
}
