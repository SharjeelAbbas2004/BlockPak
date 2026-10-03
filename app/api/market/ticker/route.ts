import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMarketOverview, type MarketCoin } from '@/lib/services/market';

export const dynamic = 'force-dynamic';

interface TickerResponse {
  coins: MarketCoin[];
}

/**
 * GET /api/market/ticker
 *
 * Reads the MarketData table when rows exist; otherwise falls back to the
 * clearly-marked MOCK data in lib/services/market. Wire MarketData to a real
 * price feed (CoinGecko/CoinMarketCap) before launch — the UI must never
 * present mock prices as real.
 */
export async function GET(): Promise<NextResponse<TickerResponse>> {
  try {
    const rows = await prisma.marketData.findMany({
      orderBy: { marketCap: 'desc' },
      select: {
        symbol: true,
        name: true,
        priceUsd: true,
        change24h: true,
        sparkline: true,
      },
    });

    if (rows.length > 0) {
      const coins: MarketCoin[] = rows.map((row) => ({
        symbol: row.symbol,
        name: row.name,
        price: row.priceUsd,
        change24h: row.change24h,
        sparkline: Array.isArray(row.sparkline)
          ? (row.sparkline as number[]).filter((v) => typeof v === 'number')
          : [],
      }));
      return NextResponse.json({ coins });
    }
  } catch {
    // DB unavailable → fall through to the mock fallback below.
  }

  // MOCK fallback — see lib/services/market.ts.
  const coins = await getMarketOverview();
  return NextResponse.json({ coins });
}
