import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ExternalLink,
  FlaskConical,
  Landmark,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import SourceLabelBadge from '@/components/ui/SourceLabelBadge';
import RegulationStatusBadge from '@/components/ui/RegulationStatusBadge';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pakistan Crypto Regulation',
  description:
    'Track every crypto and virtual-asset regulation in Pakistan — Virtual Assets Act 2026, PVARA, SBP frameworks — with official sources clearly labeled.',
};

function SourceTypeBadge({ sourceType }: { sourceType: 'OFFICIAL' | 'NEWS' }) {
  return (
    <SourceLabelBadge label={sourceType === 'OFFICIAL' ? 'OFFICIAL_SOURCE' : 'NEWS_REPORT'} />
  );
}

export default async function RegulationPage() {
  const regulations = await prisma.regulation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      sources: {
        include: { organization: { select: { name: true } } },
        orderBy: [{ sourceType: 'asc' }, { orgName: 'asc' }],
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="inline-block h-8 w-1.5 rounded-full bg-accent" aria-hidden />
          Pakistan Crypto Regulation
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          A living timeline of Pakistan&apos;s virtual-asset laws, regulators, and frameworks. Every
          entry is sourced — official documents are marked{' '}
          <span className="text-emerald-400">Official Source</span>, press coverage is marked{' '}
          <span className="text-sky-400">News Report</span>. Nothing here is speculation.
        </p>
      </header>

      {/* Regulatory disclaimer — verbatim */}
      <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-amber-200">Regulatory notice</p>
            <p className="mt-1 text-zinc-300">
              Regulatory information may change. Always consult the relevant official Pakistani
              authority and the original regulatory document for the current legal position.
            </p>
            <p className="mt-2 text-zinc-400">
              Nothing on this page is financial, investment, or legal advice. Read our full{' '}
              <Link href="/disclaimer" className="font-medium text-accent hover:text-cyan-300">
                disclaimer
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {regulations.length === 0 ? (
        <EmptyState
          title="No regulations tracked yet"
          message="Our editors are compiling Pakistan's virtual-asset regulatory record. Check back soon."
        />
      ) : (
        <ol className="relative space-y-8 border-l-2 border-border pl-6 sm:pl-10">
          {regulations.map((regulation) => (
            <li key={regulation.id} className="relative">
              <span
                className="absolute -left-[32px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent ring-4 ring-bg sm:-left-[48px]"
                aria-hidden
              />
              <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <RegulationStatusBadge status={regulation.status} />
                  {regulation.isDemo && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-300">
                      <FlaskConical className="h-3 w-3" />
                      Sample — not a real regulation
                    </span>
                  )}
                </div>

                <Link href={`/regulation/${regulation.slug}`}>
                  <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-100 transition-colors hover:text-accent sm:text-2xl">
                    {regulation.title}
                  </h2>
                </Link>

                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                  {regulation.institution && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-accent" />
                      <dt className="sr-only">Institution</dt>
                      <dd className="font-medium text-zinc-200">{regulation.institution}</dd>
                    </div>
                  )}
                  {regulation.impactArea && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-accent" />
                      <dt className="sr-only">Impact area</dt>
                      <dd>{regulation.impactArea}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    <dt className="sr-only">First tracked</dt>
                    <dd>
                      <time dateTime={regulation.createdAt.toISOString()}>
                        {formatDate(regulation.createdAt)}
                      </time>
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-accent" />
                    <dt className="sr-only">Last updated</dt>
                    <dd>
                      Updated{' '}
                      <time dateTime={regulation.updatedAt.toISOString()}>
                        {formatDate(regulation.updatedAt)}
                      </time>
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">
                  {regulation.description}
                </p>

                {regulation.isDemo && (
                  <p className="mt-3 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
                    This is a sample placeholder entry for layout and development purposes only —
                    not a real regulation, proposal, or government announcement.
                  </p>
                )}

                <Link
                  href={`/regulation/${regulation.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-cyan-300"
                >
                  <Landmark className="h-4 w-4" />
                  View full timeline &amp; status history
                </Link>

                {/* Sources */}
                <div className="mt-5 border-t border-border pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Sources</h3>
                  {regulation.sources.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">No sources recorded for this entry yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {regulation.sources.map((source) => (
                        <li
                          key={source.id}
                          className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-zinc-900/60 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-100">
                              {source.organization?.name ?? source.orgName}
                            </p>
                            <p className="mt-0.5 text-sm text-muted">{source.docTitle}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                              {source.publishedAt && (
                                <time dateTime={source.publishedAt.toISOString()}>
                                  Published {formatDate(source.publishedAt)}
                                </time>
                              )}
                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-medium text-accent hover:text-cyan-300"
                                >
                                  Official source link
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                          <SourceTypeBadge sourceType={source.sourceType} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
