'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  EmptyList,
  Toggle,
  StatusBadge,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { AdPlacementRow } from '@/components/admin/types';

function asList(data: AdPlacementRow[] | { placements: AdPlacementRow[] }): AdPlacementRow[] {
  return Array.isArray(data) ? data : data.placements;
}

export default function AdsPage() {
  const { push } = useToast();
  const [items, setItems] = useState<AdPlacementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdPlacementRow[] | { placements: AdPlacementRow[] }>(
        '/api/admin/ads',
      );
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ad placements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (row: AdPlacementRow, next: boolean) => {
    setTogglingId(row.id);
    try {
      await adminFetch(`/api/admin/ads/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      setItems((prev) => prev.map((p) => (p.id === row.id ? { ...p, isActive: next } : p)));
      push(`Placement "${row.slot}" ${next ? 'enabled' : 'disabled'}.`, 'success');
    } catch (e) {
      push(e instanceof Error ? e.message : 'Update failed.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Ad placements"
        description="Enable or disable ad slots across the site."
      />

      {loading ? (
        <LoadingState label="Loading ad placements…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No ad placements" message="Ad slots will appear here once configured." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Slot</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-4 font-medium text-zinc-100">{p.slot}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.isActive ? 'ACTIVE' : 'DRAFT'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xs text-muted">
                        {togglingId === p.id ? 'Saving…' : p.isActive ? 'On' : 'Off'}
                      </span>
                      <Toggle
                        checked={p.isActive}
                        onChange={(next) => void toggle(p, next)}
                        label={`Toggle ${p.slot}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
