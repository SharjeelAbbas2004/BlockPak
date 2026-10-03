import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/regulations — regulation tracker overview list. */
export async function GET(_req: NextRequest) {
  try {
    const regulations = await prisma.regulation.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        status: true,
        institution: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ regulations });
  } catch {
    return NextResponse.json({ error: 'Failed to load regulations.' }, { status: 500 });
  }
}
