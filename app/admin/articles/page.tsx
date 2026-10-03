'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Star, Eye } from 'lucide-react';
import { adminFetch, formatDateTime } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  EmptyList,
  ConfirmDialog,
  StatusBadge,
  GhostButton,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { ArticleListResponse, ArticleRow, ArticleStatus } from '@/components/admin/types';
import { cn } from '@/lib/utils';

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SCHEDULED', label: 'Scheduled' },
];

export default function ArticlesListPage() {
  const { push } = useToast();
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ArticleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ArticleRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async (nextStatus: string, nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      if (nextStatus) params.set('status', nextStatus);
      const res = await adminFetch<ArticleListResponse>(`/api/admin/articles?${params.toString()}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load articles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(status, page);
  }, [load, status, page]);

  const changeStatus = (next: string) => {
    setStatus(next);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/articles/${deleting.id}`, { method: 'DELETE' });
      push('Article deleted.', 'success');
      setDeleting(null);
      void load(status, page);
    } catch (e) {
      push(e instanceof Error ? e.message : 'Delete failed.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <AdminPageHeader
        title="Articles"
        description="Create, edit, and publish news articles."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New article
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => changeStatus(f.value)}
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
        <LoadingState label="Loading articles…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load(status, page)} />
      ) : !data || data.articles.length === 0 ? (
        <EmptyList
          title="No articles found"
          message={
            status
              ? `There are no ${status.toLowerCase()} articles yet.`
              : 'No articles yet. Create your first article to get started.'
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Published</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.articles.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 last:border-0">
                    <td className="max-w-[320px] px-5 py-3">
                      <Link
                        href={`/admin/articles/${a.id}`}
                        className="block truncate font-medium text-zinc-100 hover:text-accent"
                      >
                        {a.title}
                        {a.isFeatured ? (
                          <Star className="ml-1.5 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ) : null}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        /{a.slug} · {a.category.name} · {a.author.name}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={a.status as ArticleStatus} />
                    </td>
                    <td className="px-5 py-3 text-zinc-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-muted" />
                        {a.viewCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{formatDateTime(a.publishedAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/articles/${a.id}`}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-accent"
                          aria-label={`Edit ${a.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleting(a)}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                          aria-label={`Delete ${a.title}`}
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

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <GhostButton
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2"
              >
                Previous
              </GhostButton>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <GhostButton
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2"
              >
                Next
              </GhostButton>
            </div>
          ) : null}
        </>
      )}

      {deleting ? (
        <ConfirmDialog
          title="Delete article"
          message={`Permanently delete "${deleting.title}"? This cannot be undone.`}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
