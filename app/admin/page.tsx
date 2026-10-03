'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, FileText, Eye, Mail, Plus, ArrowRight } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { adminFetch, formatDateTime } from '@/components/admin/adminFetch';
import { AdminPageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/admin/ui';
import type { ArticleListResponse, ArticleRow, StatsResponse } from '@/components/admin/types';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recent, setRecent] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        adminFetch<StatsResponse>('/api/admin/stats'),
        adminFetch<ArticleListResponse>('/api/admin/articles?page=1'),
      ]);
      setStats(s);
      setRecent(a.articles.slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Content performance at a glance for Web3 Pakistan."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New article
          </Link>
        }
      />

      {loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total articles" value={String(stats.totalArticles)} />
            <StatCard label="Published" value={String(stats.published)} />
            <StatCard label="Drafts" value={String(stats.drafts)} />
            <StatCard label="Total views" value={stats.totalViews.toLocaleString()} />
            <StatCard label="Newsletter subscribers" value={String(stats.subscribers)} />
            <StatCard label="Articles today" value={String(stats.todayArticles)} />
          </div>

          <section className="mt-8 rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-zinc-100">
                <Newspaper className="h-4 w-4 text-accent" /> Recent articles
              </h2>
              <Link
                href="/admin/articles"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted">
                No articles yet. Create your first article to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Views</th>
                      <th className="px-5 py-3 font-medium">Published</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/articles/${a.id}`}
                            className="font-medium text-zinc-100 hover:text-accent"
                          >
                            {a.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">
                            {a.category.name} · {a.author.name}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-5 py-3 text-zinc-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-muted" />
                            {a.viewCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted">{formatDateTime(a.publishedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/comments"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">Moderate comments</p>
                <p className="text-xs text-muted">Review the pending comment queue</p>
              </div>
            </Link>
            <Link
              href="/admin/breaking"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <FileText className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">Breaking news ticker</p>
                <p className="text-xs text-muted">Manage the homepage ticker items</p>
              </div>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
