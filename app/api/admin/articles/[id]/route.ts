import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { sanitizeHtml } from '@/lib/sanitize';
import { readJson, validationError } from '@/lib/http';
import { adminArticleUpdateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/articles/[id] — full article for the admin editor. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        articleTags: { select: { tagId: true } },
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
    });
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }
    const { articleTags, ...rest } = article;
    return NextResponse.json({
      ...rest,
      tagIds: articleTags.map((t) => t.tagId),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load article.' }, { status: 500 });
  }
}

/** PUT /api/admin/articles/[id] — update an article (content sanitized on write). */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adminArticleUpdateSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;

  try {
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, publishedAt: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    if (data.slug) {
      const clash = await prisma.article.findFirst({
        where: { slug: data.slug, id: { not: params.id } },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: 'An article with this slug already exists.' },
          { status: 409 },
        );
      }
    }

    const nextStatus = data.status ?? existing.status;
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
        // Sanitize before persisting — stored XSS must never reach readers.
        ...(data.content !== undefined ? { content: sanitizeHtml(data.content) } : {}),
        ...(data.subtitle !== undefined ? { subtitle: data.subtitle || null } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.authorId !== undefined ? { authorId: data.authorId } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.readingMinutes !== undefined ? { readingMinutes: data.readingMinutes } : {}),
        ...(data.sourceLabel !== undefined ? { sourceLabel: data.sourceLabel } : {}),
        ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle || null } : {}),
        ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription || null } : {}),
        ...(data.canonicalUrl !== undefined ? { canonicalUrl: data.canonicalUrl || null } : {}),
        // Stamp publishedAt when newly published; clear when unpublished.
        ...(data.status === 'PUBLISHED' && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
        ...(nextStatus !== 'PUBLISHED' && existing.publishedAt && data.status
          ? { publishedAt: null }
          : {}),
        ...(data.tagIds !== undefined
          ? {
              articleTags: {
                deleteMany: {},
                create: data.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      select: { id: true, slug: true, status: true },
    });

    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: 'Failed to update article.' }, { status: 500 });
  }
}

/** DELETE /api/admin/articles/[id] — delete an article. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    await prisma.article.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete article.' }, { status: 500 });
  }
}
