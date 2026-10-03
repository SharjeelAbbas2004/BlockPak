import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/tags — all tags for the article editor tag selector. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: 'Failed to load tags.' }, { status: 500 });
  }
}
