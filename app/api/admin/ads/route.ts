import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/ads → { placements } — all ad placements (active and inactive). */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const placements = await prisma.adPlacement.findMany({
      orderBy: { slot: 'asc' },
    });
    return NextResponse.json({ placements });
  } catch {
    return NextResponse.json({ error: 'Failed to load ad placements.' }, { status: 500 });
  }
}
