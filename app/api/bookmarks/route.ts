import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Toggle a bookmark for the signed-in user. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to bookmark articles.' }, { status: 401 });
  }

  let articleId: unknown;
  try {
    const body = (await req.json()) as { articleId?: unknown };
    articleId = body.articleId;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (typeof articleId !== 'string' || articleId.length === 0) {
    return NextResponse.json({ error: 'articleId is required.' }, { status: 400 });
  }

  const userId = session.user.id;
  const where = { userId_articleId: { userId, articleId } };

  try {
    const existing = await prisma.bookmark.findUnique({ where });
    if (existing) {
      await prisma.bookmark.delete({ where });
      return NextResponse.json({ bookmarked: false });
    }
    await prisma.bookmark.create({ data: { userId, articleId } });
    return NextResponse.json({ bookmarked: true });
  } catch {
    return NextResponse.json({ error: 'Could not update bookmark.' }, { status: 503 });
  }
}
