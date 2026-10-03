'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X, Trash2, Loader2 } from 'lucide-react';
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
import type { CommentRow, CommentStatus } from '@/components/admin/types';
import { cn } from '@/lib/utils';

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function asList(data: CommentRow[] | { items: CommentRow[] }): CommentRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function CommentsPage() {
  const { push } = useToast();
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CommentRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async (nextStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextStatus) params.set('status', nextStatus);
      const query = params.toString();
      const data = await adminFetch<CommentRow[] | { items: CommentRow[] }>(
        `/api/admin/comments${query ? `?${query}` : ''}`,
      );
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(status);
  }, [load, status]);

  const setCommentStatus = async (comment: CommentRow, next: CommentStatus) => {
    setActingId(comment.id);
    try {
      await adminFetch(`/api/admin/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setItems((prev) => prev.map((c) => (c.id === comment.id ? { ...c, status: next } : c)));
      push(next === 'APPROVED' ? 'Comment approved.' : 'Comment rejected.', 'success');
    } catch (e) {
      push(e instanceof Error ? e.message : 'Update failed.', 'error');
    } finally {
      setActingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/comments/${deleting.id}`, { method: 'DELETE' });
      push('Comment deleted.', 'success');
      setDeleting(null);
      void load(status);
    } catch (e) {
      push(e instanceof Error ? e.message : 'Delete failed.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Comments"
        description="Moderate reader comments before they go live."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              status === f.value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-muted hover:border-zinc-500 hover:text-zinc-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading comments…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load(status)} />
      ) : items.length === 0 ? (
        <EmptyList
          title="No comments"
          message={status ? `No ${status.toLowerCase()} comments.` : 'Reader comments will appear here for moderation.'}
        />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-accent">
                    {(c.user.name ?? c.user.email).charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100">
                      {c.user.name ?? 'Anonymous'}{' '}
                      <span className="font-normal text-muted">· {c.user.email}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      On <span className="text-zinc-300">{c.article.title}</span> · {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{c.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.status !== 'APPROVED' ? (
                  <button
                    type="button"
                    onClick={() => void setCommentStatus(c, 'APPROVED')}
                    disabled={actingId === c.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {actingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                ) : null}
                {c.status !== 'REJECTED' ? (
                  <button
                    type="button"
                    onClick={() => void setCommentStatus(c, 'REJECTED')}
                    disabled={actingId === c.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDeleting(c)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting ? (
        <ConfirmDialog
          title="Delete comment"
          message="Permanently delete this comment? This cannot be undone."
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
