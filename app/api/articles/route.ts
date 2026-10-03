import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { articleQuerySchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

const articleCardSelect = {
  slug: true,
  title: true,
  excerpt: true,
  imageUrl: true,
  category: { select: { name: true, slug: true } },
  author: { select: { name: true } },
  publishedAt: true,
  readingMinutes: true,
  sourceLabel: true,
} as const;

/**
 * GET /api/articles?category=<slug>&tag=<slug>&page=1&limit=12&featured=true&status=published
 * Public readers only ever see PUBLISHED articles. Admins (logged-in session)
 * may pass status=draft|scheduled|published|all to preview other states.
 */
export async function GET(req: NextRequest) {
  const query = articleQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!query.success) {
    return NextResponse.json({ error: 'Invalid query parameters.' }, { status: 400 });
  }

  const { category, tag, page, limit, featured, status } = query.data;

  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    let statusFilter: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | undefined = 'PUBLISHED';
    if (isAdmin && status && status !== 'all') {
      statusFilter = status.toUpperCase() as 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
    } else if (isAdmin && status === 'all') {
      statusFilter = undefined;
    }

    const where = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { articleTags: { some: { tag: { slug: tag } } } } : {}),
      ...(featured === 'true' ? { isFeatured: true } : {}),
      ...(featured === 'false' ? { isFeatured: false } : {}),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: articleCardSelect,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load articles.' }, { status: 500 });
  }
}
