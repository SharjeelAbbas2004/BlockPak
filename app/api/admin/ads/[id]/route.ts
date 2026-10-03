import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { adUpdateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/ads/[id] { isActive } — toggle an ad placement. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adUpdateSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existing = await prisma.adPlacement.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Ad placement not found.' }, { status: 404 });
    }

    const placement = await prisma.adPlacement.update({
      where: { id: params.id },
      data: { isActive: parsed.data.isActive },
    });
    return NextResponse.json({ placement });
  } catch {
    return NextResponse.json({ error: 'Failed to update ad placement.' }, { status: 500 });
  }
}
