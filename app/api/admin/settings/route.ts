import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { settingSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/settings → { settings: [{ key, value }] }. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
      select: { key: true, value: true },
    });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Failed to load settings.' }, { status: 500 });
  }
}

/** PUT /api/admin/settings { key, value } — upsert one setting. */
export async function PUT(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = settingSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const setting = await prisma.siteSetting.upsert({
      where: { key: parsed.data.key },
      update: { value: parsed.data.value },
      create: { key: parsed.data.key, value: parsed.data.value },
      select: { key: true, value: true },
    });
    return NextResponse.json({ setting });
  } catch {
    return NextResponse.json({ error: 'Failed to save setting.' }, { status: 500 });
  }
}
