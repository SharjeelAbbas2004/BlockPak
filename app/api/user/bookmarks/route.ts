import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Signed-in user's saved articles (the existing /api/bookmarks POST toggle
 * stays untouched — this route is list-only).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
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
        },
      },
    });

    return NextResponse.json({
      bookmarks: bookmarks.map((b) => ({
        savedAt: b.createdAt.toISOString(),
        article: b.article,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Could not load bookmarks.' }, { status: 503 });
  }
}
