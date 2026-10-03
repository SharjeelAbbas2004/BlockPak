import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Active breaking-news items for the ticker bar. Fails soft → []. */
export async function GET() {
  try {
    const items = await prisma.breakingNews.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: { id: true, text: true, url: true },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: 'Not allowed.' }, { status: 405 });
}
