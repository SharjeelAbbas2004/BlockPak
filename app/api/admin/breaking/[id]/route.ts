import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { adminBreakingSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/breaking/[id] — update a breaking-news item. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adminBreakingSchema.partial().safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existing = await prisma.breakingNews.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Breaking news item not found.' }, { status: 404 });
    }

    const item = await prisma.breakingNews.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.text !== undefined ? { text: parsed.data.text } : {}),
        ...(parsed.data.url !== undefined ? { url: parsed.data.url || null } : {}),
        ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Failed to update breaking news.' }, { status: 500 });
  }
}

/** DELETE /api/admin/breaking/[id] — delete a breaking-news item. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.breakingNews.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Breaking news item not found.' }, { status: 404 });
    }

    await prisma.breakingNews.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete breaking news.' }, { status: 500 });
  }
}
