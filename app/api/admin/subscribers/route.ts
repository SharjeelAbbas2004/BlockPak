import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/subscribers → { items } — newsletter subscriber list. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const items = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Failed to load subscribers.' }, { status: 500 });
  }
}
