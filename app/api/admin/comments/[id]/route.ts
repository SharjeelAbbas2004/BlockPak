import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { commentStatusSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/comments/[id] { status } — approve/reject a comment. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = commentStatusSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existing = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    const comment = await prisma.comment.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: 'Failed to update comment.' }, { status: 500 });
  }
}

/** DELETE /api/admin/comments/[id] — delete a comment. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    await prisma.comment.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete comment.' }, { status: 500 });
  }
}
