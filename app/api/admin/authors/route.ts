import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { authorSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/authors — all authors with article counts. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json({ authors });
  } catch {
    return NextResponse.json({ error: 'Failed to load authors.' }, { status: 500 });
  }
}

/** POST /api/admin/authors — create an author. */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = authorSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const author = await prisma.author.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        bio: parsed.data.bio || null,
        avatarUrl: parsed.data.avatarUrl || null,
      },
    });
    return NextResponse.json({ author }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create author. The slug may already exist.' },
      { status: 500 },
    );
  }
}
