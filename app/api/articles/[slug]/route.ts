import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/articles/[slug] — full published article + related articles.
 * 404 unless the article is PUBLISHED.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        excerpt: true,
        content: true,
        imageUrl: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true, slug: true, bio: true, avatarUrl: true } },
        publishedAt: true,
        readingMinutes: true,
        sourceLabel: true,
        viewCount: true,
        sources: {
          select: {
            id: true,
            orgName: true,
            docTitle: true,
            url: true,
            publishedAt: true,
            sourceType: true,
          },
        },
        articleTags: {
          select: { tag: { select: { name: true, slug: true } } },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const related = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        category: { slug: article.category.slug },
        slug: { not: slug },
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
        publishedAt: true,
        readingMinutes: true,
        sourceLabel: true,
      },
    });

    return NextResponse.json({ article, related });
  } catch {
    return NextResponse.json({ error: 'Failed to load article.' }, { status: 500 });
  }
}
