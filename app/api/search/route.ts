import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toCardArticle } from '@/lib/articles';
import type { CardArticle } from '@/components/cards/NewsCard';

export const dynamic = 'force-dynamic';

/**
 * Article search.
 *
 * - SearchModal compat: GET /api/search?q=<text> → { results: CardArticle[] } (defaults: 8, relevance).
 * - Full search page: &sort=relevance|newest|oldest &category=<slug> &from=<yyyy-mm-dd> &to=<yyyy-mm-dd> &limit=<1..50>.
 * Fails soft → { results: [] }.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const sort = params.get('sort')?.trim() ?? 'relevance';
  const category = params.get('category')?.trim() ?? '';
  const from = params.get('from')?.trim() ?? '';
  const to = params.get('to')?.trim() ?? '';
  const limit = Math.min(Math.max(Number(params.get('limit')) || 8, 1), 50);

  const publishedAt: Prisma.DateTimeFilter = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) publishedAt.gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      publishedAt.lte = toDate;
    }
  }

  const where: Prisma.ArticleWhereInput = {
    status: 'PUBLISHED',
    OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ],
    ...(category ? { category: { slug: category } } : {}),
    ...(Object.keys(publishedAt).length > 0 ? { publishedAt } : {}),
  };

  const orderBy: Prisma.ArticleOrderByWithRelationInput =
    sort === 'oldest' ? { publishedAt: 'asc' } : { publishedAt: 'desc' };

  try {
    const rows = await prisma.article.findMany({
      where,
      orderBy,
      take: limit,
      include: { category: true, author: true },
    });

    const results: CardArticle[] = (rows as unknown[])
      .map(toCardArticle)
      .filter((a): a is CardArticle => a !== null);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
