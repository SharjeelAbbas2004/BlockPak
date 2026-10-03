import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { authorSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/authors/[id] — update an author. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = authorSchema.partial().safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existing = await prisma.author.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 });
    }

    const author = await prisma.author.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
        ...(parsed.data.bio !== undefined ? { bio: parsed.data.bio || null } : {}),
        ...(parsed.data.avatarUrl !== undefined
          ? { avatarUrl: parsed.data.avatarUrl || null }
          : {}),
      },
    });
    return NextResponse.json({ author });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update author. The slug may already exist.' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/authors/[id] — blocked when the author has articles. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.author.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 });
    }

    const articleCount = await prisma.article.count({
      where: { authorId: params.id },
    });
    if (articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${articleCount} article(s) still use this author.` },
        { status: 400 },
      );
    }

    await prisma.author.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete author.' }, { status: 500 });
  }
}
