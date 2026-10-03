import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ingestion/status — exposes the content-ingestion pipeline state.
 * Scaffolded: stages are documented but disabled until RSS/API sources are
 * connected. See lib/services/ingestion.ts for the full design.
 */
export async function GET(_req: NextRequest) {
  return NextResponse.json({
    enabled: false,
    stages: ['fetch', 'dedupe', 'verify', 'review', 'publish'],
    message:
      'Ingestion pipeline is scaffolded; connect RSS/API sources to enable.',
  });
}
