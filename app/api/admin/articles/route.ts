import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { sanitizeHtml } from '@/lib/sanitize';
import { readJson, validationError } from '@/lib/http';
import { adminArticleSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

const adminListQuery = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

const LIST_LIMIT = 20;

/** GET /api/admin/articles?status=&page= — admin article list. */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const query = adminListQuery.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!query.success) return validationError(query.error);

  const { status, page } = query.data;
  const where = status ? { status } : {};

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * LIST_LIMIT,
        take: LIST_LIMIT,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          isFeatured: true,
          publishedAt: true,
          viewCount: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      totalPages: Math.max(1, Math.ceil(total / LIST_LIMIT)),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load articles.' }, { status: 500 });
  }
}

/** POST /api/admin/articles — create an article. Content is sanitized on write. */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adminArticleSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;

  try {
    const slugTaken = await prisma.article.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (slugTaken) {
      return NextResponse.json({ error: 'An article with this slug already exists.' }, { status: 409 });
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        // Sanitize before persisting — stored XSS must never reach readers.
        content: sanitizeHtml(data.content),
        subtitle: data.subtitle || null,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
        imageUrl: data.imageUrl || null,
        isFeatured: data.isFeatured ?? false,
        readingMinutes: data.readingMinutes ?? 5,
        sourceLabel: data.sourceLabel ?? 'NEWS_REPORT',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        ...(data.tagIds && data.tagIds.length > 0
          ? { articleTags: { create: data.tagIds.map((tagId) => ({ tagId })) } }
          : {}),
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create article.' }, { status: 500 });
  }
}
