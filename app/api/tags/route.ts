import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/tags — all tags with published-article counts. */
export async function GET(_req: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            articleTags: {
              where: { article: { status: 'PUBLISHED' } },
            },
          },
        },
      },
    });
    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: 'Failed to load tags.' }, { status: 500 });
  }
}
