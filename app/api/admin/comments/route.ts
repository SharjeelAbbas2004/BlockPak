import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { validationError } from '@/lib/http';

export const dynamic = 'force-dynamic';

const commentsQuery = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

const LIST_LIMIT = 20;

/**
 * GET /api/admin/comments?status= →
 * { items: [{ id, content, status, createdAt, article: { title, slug }, user: { name, email } }] }
 */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const query = commentsQuery.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!query.success) return validationError(query.error);

  const { status, page } = query.data;
  const where = status ? { status } : {};

  try {
    const items = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * LIST_LIMIT,
      take: LIST_LIMIT,
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        article: { select: { title: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Failed to load comments.' }, { status: 500 });
  }
}
