import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/tags/[slug] — tag details + its published articles. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'Tag not found.' }, { status: 404 });
  }

  try {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: { name: true, slug: true },
    });
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found.' }, { status: 404 });
    }

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        articleTags: { some: { tag: { slug } } },
      },
      orderBy: { publishedAt: 'desc' },
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

    return NextResponse.json({ tag, articles });
  } catch {
    return NextResponse.json({ error: 'Failed to load tag.' }, { status: 500 });
  }
}
