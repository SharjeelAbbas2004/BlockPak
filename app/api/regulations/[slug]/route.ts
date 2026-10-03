import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/regulations/[slug] — one regulation with its timeline events
 * (chronological) and attached sources.
 *
 * The regulation tracker only presents editorially-created records; it never
 * fabricates government announcements. Event entries must cite sources via
 * the `sources` relation, and the public pages render source citations.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'Regulation not found.' }, { status: 404 });
  }

  try {
    const regulation = await prisma.regulation.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        description: true,
        status: true,
        institution: true,
        impactArea: true,
        updatedAt: true,
        events: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            title: true,
            description: true,
            status: true,
            sourceUrl: true,
          },
        },
        sources: {
          select: {
            id: true,
            orgName: true,
            docTitle: true,
            url: true,
            publishedAt: true,
            sourceType: true,
          },
        },
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
