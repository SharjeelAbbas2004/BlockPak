'use client';

import Link from 'next/link';
import type { MarketCoin } from '@/lib/services/market';
import { cn } from '@/lib/utils';

interface MarketTickerProps {
  items: MarketCoin[];
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 72;
  const h = 22;
  const points = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(1)}`)
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(4)}`;
}

export default function MarketTicker({ items }: MarketTickerProps) {
  if (!items || items.length === 0) return null;

  // Duplicate the list so the marquee loop is seamless.
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-border bg-surface/60" aria-label="Market prices">
      <div className="ticker-track flex w-max animate-marquee items-center gap-8 px-4 py-2">
        {loop.map((coin, i) => {
          const positive = coin.change24h >= 0;
          return (
            <Link
              key={`${coin.symbol}-${i}`}
              href="/crypto"
              className="flex shrink-0 items-center gap-2 text-xs"
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : 0}
            >
              <span className="font-bold text-zinc-100">{coin.symbol}</span>
              <span className="text-muted">{formatPrice(coin.price)}</span>
              <span className={cn('font-semibold', positive ? 'text-green-500' : 'text-red-500')}>
                {positive ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
              </span>
              <Sparkline data={coin.sparkline} positive={positive} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
