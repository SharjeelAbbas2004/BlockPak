import { NextResponse } from 'next/server';
import { buildDailyBrief } from '@/lib/dailyBrief';

export const dynamic = 'force-dynamic';

/**
 * GET /api/daily-brief
 * Returns the Web3 Pakistan Daily Brief as JSON for future newsletter automation.
 * Shape: { date, todayIn60Seconds[], pakistan[], global[], regulation[], markets{}, watch[] }
 */
export async function GET() {
  const brief = await buildDailyBrief();
  return NextResponse.json({
    date: brief.date,
    todayIn60Seconds: brief.todayIn60Seconds,
    pakistan: brief.pakistan,
    global: brief.global,
    regulation: brief.regulation,
    markets: brief.markets,
    watch: brief.watch,
  });
}
