import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { adminRegulationSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/regulations — all regulations with event counts. */
export async function GET(_req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const regulations = await prisma.regulation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { events: true } } },
    });
    return NextResponse.json({ regulations });
  } catch {
    return NextResponse.json({ error: 'Failed to load regulations.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/regulations — create a regulation with timeline events.
 * Regulatory claims are editorially authored here and must cite sources on
 * the public page — nothing is ever invented by automation.
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adminRegulationSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;

  try {
    const regulation = await prisma.regulation.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status,
        institution: data.institution || null,
        impactArea: data.impactArea || null,
        ...(data.events && data.events.length > 0
          ? {
              events: {
                create: data.events.map((event) => ({
                  date: new Date(event.date),
                  title: event.title,
                  description: event.description,
                  status: event.status,
                  sourceUrl: event.sourceUrl || null,
                })),
              },
            }
          : {}),
      },
      select: { id: true, slug: true },
    });
    return NextResponse.json({ regulation }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create regulation. The slug may already exist.' },
      { status: 500 },
    );
  }
}
