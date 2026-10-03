import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Signed-in user's reading history, newest first (latest 100). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  }

  try {
    const entries = await prisma.readingHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { viewedAt: 'desc' },
      take: 100,
    });

    const articleIds = entries.map((e) => e.articleId).filter((id, i, arr) => arr.indexOf(id) === i);
    const articles = await prisma.article.findMany({
      where: { id: { in: articleIds }, status: 'PUBLISHED' },
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
      },
    });
    const byId = new Map(articles.map((a) => [a.id, a]));

    return NextResponse.json({
      history: entries
        .map((e) => ({ viewedAt: e.viewedAt.toISOString(), article: byId.get(e.articleId) ?? null }))
        .filter((h) => h.article !== null),
    });
  } catch {
    return NextResponse.json({ error: 'Could not load reading history.' }, { status: 503 });
  }
}
