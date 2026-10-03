import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/stats — dashboard counters. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalArticles, published, drafts, views, subscribers, todayArticles] =
      await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { status: 'PUBLISHED' } }),
        prisma.article.count({ where: { status: 'DRAFT' } }),
        prisma.article.aggregate({ _sum: { viewCount: true } }),
        prisma.newsletterSubscriber.count({ where: { isActive: true } }),
        prisma.article.count({
          where: { status: 'PUBLISHED', publishedAt: { gte: startOfDay } },
        }),
      ]);

    return NextResponse.json({
      totalArticles,
      published,
      drafts,
      totalViews: views._sum.viewCount ?? 0,
      subscribers,
      todayArticles,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 });
  }
}
