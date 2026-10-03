import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { categorySchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/categories/[id] — update a category. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = categorySchema.partial().safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description || null }
          : {}),
      },
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update category. The slug may already exist.' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/categories/[id] — blocked when articles use it. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const articleCount = await prisma.article.count({
      where: { categoryId: params.id },
    });
    if (articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${articleCount} article(s) still use this category.` },
        { status: 400 },
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
  }
}
