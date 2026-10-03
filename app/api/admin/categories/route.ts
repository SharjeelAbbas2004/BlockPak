import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { categorySchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/categories — all categories with article counts. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Failed to load categories.' }, { status: 500 });
  }
}

/** POST /api/admin/categories — create a category. */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = categorySchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create category. The slug may already exist.' },
      { status: 500 },
    );
  }
}
