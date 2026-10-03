import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** DELETE /api/admin/subscribers/[id] — remove a subscriber. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 });
    }

    await prisma.newsletterSubscriber.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete subscriber.' }, { status: 500 });
  }
}
