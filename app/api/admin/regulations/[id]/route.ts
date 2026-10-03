import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { readJson, validationError } from '@/lib/http';
import { adminRegulationUpdateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/** GET /api/admin/regulations/[id] — regulation with events and sources for the admin editor. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const regulation = await prisma.regulation.findUnique({
      where: { id: params.id },
      include: {
        events: { orderBy: { date: 'asc' } },
        sources: true,
      },
    });
    if (!regulation) {
      return NextResponse.json({ error: 'Regulation not found.' }, { status: 404 });
    }
    return NextResponse.json({ regulation });
  } catch {
    return NextResponse.json({ error: 'Failed to load regulation.' }, { status: 500 });
  }
}

/** PUT /api/admin/regulations/[id] — update; nested events are fully replaced. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const parsedBody = await readJson(req);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = adminRegulationUpdateSchema.safeParse(parsedBody.body);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;

  try {
    const existing = await prisma.regulation.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found.' }, { status: 404 });
    }

    if (data.slug) {
      const clash = await prisma.regulation.findFirst({
        where: { slug: data.slug, id: { not: params.id } },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: 'A regulation with this slug already exists.' },
          { status: 409 },
        );
      }
    }

    const regulation = await prisma.regulation.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.institution !== undefined ? { institution: data.institution || null } : {}),
        ...(data.impactArea !== undefined ? { impactArea: data.impactArea || null } : {}),
        // Nested events replace: delete all, then re-create the supplied list.
        ...(data.events !== undefined
          ? {
              events: {
                deleteMany: {},
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

    return NextResponse.json({ regulation });
  } catch {
    return NextResponse.json({ error: 'Failed to update regulation.' }, { status: 500 });
  }
}

/** DELETE /api/admin/regulations/[id] — delete a regulation and its events. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  try {
    const existing = await prisma.regulation.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found.' }, { status: 404 });
    }

    await prisma.regulation.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete regulation.' }, { status: 500 });
  }
}
