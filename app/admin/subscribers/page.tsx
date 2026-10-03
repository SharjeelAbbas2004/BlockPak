'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminFetch, formatDateTime } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  EmptyList,
  ConfirmDialog,
  StatusBadge,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { SubscriberRow } from '@/components/admin/types';

function asList(data: SubscriberRow[] | { items: SubscriberRow[] }): SubscriberRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function SubscribersPage() {
  const { push } = useToast();
  const [items, setItems] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SubscriberRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<SubscriberRow[] | { items: SubscriberRow[] }>(
        '/api/admin/subscribers',
      );
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/subscribers/${deleting.id}`, { method: 'DELETE' });
      push('Subscriber removed.', 'success');
      setDeleting(null);
      void load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Delete failed.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Subscribers"
        description={`Newsletter subscribers (${items.length}).`}
      />

      {loading ? (
        <LoadingState label="Loading subscribers…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No subscribers" message="Newsletter signups will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-zinc-100">{s.email}</td>
                  <td className="px-5 py-3 text-zinc-300">{s.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={s.isActive === false ? 'REJECTED' : 'APPROVED'} />
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(s.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDeleting(s)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                        aria-label={`Remove ${s.email}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleting ? (
        <ConfirmDialog
          title="Remove subscriber"
          message={`Remove ${deleting.email} from the newsletter list?`}
          confirmLabel="Remove"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
