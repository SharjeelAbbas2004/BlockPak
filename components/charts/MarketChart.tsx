'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface MarketChartProps {
  symbol: string;
  data: number[];
}

/** Lightweight area chart for a coin's sparkline data (mock data for now). */
export default function MarketChart({ symbol, data }: MarketChartProps) {
  const points = useMemo(
    () => data.map((v, i) => ({ i, v: Number(v.toFixed(2)) })),
    [data],
  );

  if (points.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted">
        Chart data unavailable
      </div>
    );
  }

  const up = points[points.length - 1].v >= points[0].v;
  const color = up ? '#22c55e' : '#ef4444';

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2 text-sm font-bold text-zinc-100">
        {symbol} <span className="font-normal text-muted">/ USD · 24h trend (demo data)</span>
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: '#131316',
                border: '1px solid #27272a',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, symbol]}
              labelFormatter={() => ''}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
