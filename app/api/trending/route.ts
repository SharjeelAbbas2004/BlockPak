import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toCardArticle } from '@/lib/articles';
import type { CardArticle } from '@/components/cards/NewsCard';

export const dynamic = 'force-dynamic';

/** Top 10 published articles by view count. Fails soft → { articles: [] }. */
export async function GET() {
  try {
    const rows = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 10,
      include: { category: true, author: true },
    });

    const articles: CardArticle[] = (rows as unknown[])
      .map(toCardArticle)
      .filter((a): a is CardArticle => a !== null);

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
