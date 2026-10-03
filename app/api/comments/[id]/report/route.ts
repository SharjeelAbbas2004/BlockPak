import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Report a comment for moderator review.
 *
 * NOTE (stub): there is no CommentReport model in the schema yet, so reports
 * are acknowledged and logged server-side but not persisted. To make reports
 * durable, add a CommentReport model (commentId, reporterId, reason,
 * createdAt) and store a row here instead of just logging.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to report a comment.' }, { status: 401 });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });
    if (!comment || comment.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    console.info(
      `[comment-report] user ${session.user.id} reported comment ${comment.id} — pending CommentReport model`,
    );

    return NextResponse.json({
      ok: true,
      message: 'Thanks — our moderators will review this comment.',
    });
  } catch {
    return NextResponse.json({ error: 'Could not report this comment.' }, { status: 503 });
  }
}
