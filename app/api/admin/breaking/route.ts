import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { adminBreakingSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/breaking — all breaking-news items (active and inactive). */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const items = await prisma.breakingNews.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Failed to load breaking news.' }, { status: 500 });
  }
}

/** POST /api/admin/breaking — create a breaking-news item. */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adminBreakingSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const item = await prisma.breakingNews.create({
      data: {
        text: parsed.data.text,
        url: parsed.data.url || null,
        priority: parsed.data.priority ?? 0,
        isActive: parsed.data.isActive ?? true,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create breaking news.' }, { status: 500 });
  }
}
