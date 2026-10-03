import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Record an article view. Rate-limited in memory to one recorded view per
 * IP+article per hour (module-level map; single-instance approximation).
 *
 * Always records an ArticleView and bumps Article.viewCount; if the visitor
 * is signed in, also appends to their ReadingHistory.
 */
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const seen = new Map<string, number>();

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function prune() {
  if (seen.size < 10_000) return;
  const cutoff = Date.now() - RATE_LIMIT_MS;
  seen.forEach((at, key) => {
    if (at < cutoff) seen.delete(key);
  });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true },
    });
    if (!article || article.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const key = `${getIp(req)}:${article.id}`;
    const now = Date.now();
    const last = seen.get(key);
    if (last && now - last < RATE_LIMIT_MS) {
      return NextResponse.json({ ok: true, deduped: true });
    }
    seen.set(key, now);
    prune();

    await prisma.articleView.create({ data: { articleId: article.id } });
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.readingHistory.create({
        data: { userId: session.user.id, articleId: article.id },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not record view.' }, { status: 503 });
  }
}
