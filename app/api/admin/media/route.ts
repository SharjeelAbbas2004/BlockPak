import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { mediaSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/media → { items } — media library. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const items = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Failed to load media.' }, { status: 500 });
  }
}

/** POST /api/admin/media { url, alt? } — register an uploaded/hosted image. */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = mediaSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const item = await prisma.media.create({
      data: {
        url: parsed.data.url,
        alt: parsed.data.alt || null,
        uploadedById: gate.session.user.id || null,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save media.' }, { status: 500 });
  }
}
