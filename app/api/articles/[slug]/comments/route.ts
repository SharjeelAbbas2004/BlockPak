import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { commentSchema } from '@/lib/validations';
import { sanitizeComment } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

interface CommentNode {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  userName: string;
  replies: CommentNode[];
}

/** Public: approved comments for an article, with one level of replies. */
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });
    if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

    const rows = await prisma.comment.findMany({
      where: { articleId: article.id, status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        likes: true,
        createdAt: true,
        parentId: true,
        user: { select: { name: true } },
      },
    });

    const byId = new Map<string, CommentNode>();
    const top: CommentNode[] = [];
    for (const r of rows) {
      byId.set(r.id, {
        id: r.id,
        content: r.content,
        likes: r.likes,
        createdAt: r.createdAt.toISOString(),
        userName: r.user.name?.trim() || 'Reader',
        replies: [],
      });
    }
    for (const r of rows) {
      const node = byId.get(r.id);
      if (!node) continue;
      if (r.parentId) {
        byId.get(r.parentId)?.replies.push(node);
      } else {
        top.push(node);
      }
    }

    return NextResponse.json({ comments: top });
  } catch {
    return NextResponse.json({ error: 'Could not load comments.' }, { status: 503 });
  }
}

/**
 * Post a comment (signed-in users). New comments enter PENDING status and
 * show an "awaiting moderation" note to the author until approved.
 */
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to comment.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = z.object({
    content: commentSchema.shape.content,
    parentId: z.string().min(1).optional(),
  }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check your comment.' },
      { status: 400 },
    );
  }

  const content = sanitizeComment(parsed.data.content);
  if (!content) {
    return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true },
    });
    if (!article || article.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    let parentId: string | undefined;
    if (parsed.data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parsed.data.parentId },
        select: { id: true, articleId: true, parentId: true, status: true },
      });
      // Replies are one level deep: the parent must be a top-level, approved
      // comment on the same article.
      if (!parent || parent.articleId !== article.id || parent.parentId || parent.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Cannot reply to that comment.' }, { status: 400 });
      }
      parentId = parent.id;
    }

    const created = await prisma.comment.create({
      data: {
        articleId: article.id,
        userId: session.user.id,
        content,
        parentId,
        status: 'PENDING',
      },
      select: {
        id: true,
        content: true,
        likes: true,
        createdAt: true,
        status: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: created.id,
          content: created.content,
          likes: created.likes,
          createdAt: created.createdAt.toISOString(),
          userName: created.user.name?.trim() || 'Reader',
          status: created.status,
          replies: [],
        } satisfies CommentNode & { status: string },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Could not post your comment.' }, { status: 503 });
  }
}
