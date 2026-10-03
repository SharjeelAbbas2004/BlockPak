import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { History, Clock } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Your reading history' };

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?callbackUrl=/history');

  const entries = await prisma.readingHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { viewedAt: 'desc' },
    take: 100,
  });

  const articles = await prisma.article.findMany({
    where: {
      id: { in: entries.map((e) => e.articleId).filter((id, i, arr) => arr.indexOf(id) === i) },
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: { select: { name: true, slug: true } },
    },
  });
  const byId = new Map(articles.map((a) => [a.id, a]));
  const rows = entries
    .map((e) => ({ viewedAt: e.viewedAt, article: byId.get(e.articleId) ?? null }))
    .filter((r): r is { viewedAt: Date; article: NonNullable<ReturnType<typeof byId.get>> } =>
      r.article !== null,
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-zinc-100">
        <History className="h-6 w-6 text-accent" /> Reading history
        {rows.length > 0 && <span className="text-sm font-medium text-muted">({rows.length})</span>}
      </h1>
      <p className="mt-2 text-sm text-muted">The stories you have read recently.</p>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            message="Stories you read while signed in will appear in your history."
          />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface/60">
            {rows.map(({ viewedAt, article }) => (
              <li key={`${article.id}-${viewedAt.toISOString()}`}>
                <Link
                  href={`/news/${article.slug}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-surface sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      {article.category.name}
                    </p>
                    <p className="clamp-2 mt-0.5 text-sm font-semibold text-zinc-100">
                      {article.title}
                    </p>
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(viewedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
