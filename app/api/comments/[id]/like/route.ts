import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Like an approved comment (public, one increment per call; client dedupes per session). */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });
    if (!comment || comment.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    const updated = await prisma.comment.update({
      where: { id: comment.id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });
    return NextResponse.json({ likes: updated.likes });
  } catch {
    return NextResponse.json({ error: 'Could not like this comment.' }, { status: 503 });
  }
}
