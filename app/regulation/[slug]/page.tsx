import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  FlaskConical,
  History,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import SourceLabelBadge from '@/components/ui/SourceLabelBadge';
import RegulationStatusBadge from '@/components/ui/RegulationStatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const regulation = await prisma.regulation.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true },
  });
  if (!regulation) return { title: 'Regulation not found' };
  return {
    title: regulation.title,
    description: regulation.description.slice(0, 160),
  };
}

export default async function RegulationDetailPage({ params }: { params: { slug: string } }) {
  const regulation = await prisma.regulation.findUnique({
    where: { slug: params.slug },
    include: {
      events: { orderBy: { date: 'asc' } },
      sources: {
        include: { organization: { select: { name: true, websiteUrl: true } } },
        orderBy: [{ sourceType: 'asc' }, { orgName: 'asc' }],
      },
    },
  });

  if (!regulation) notFound();

  // Status history: distinct statuses in the order they first appeared.
  const statusHistory: Array<{ status: (typeof regulation.events)[number]['status']; date: Date }> = [];
  for (const event of regulation.events) {
    const last = statusHistory[statusHistory.length - 1];
    if (!last || last.status !== event.status) {
      statusHistory.push({ status: event.status, date: event.date });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/regulation"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        All regulations
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <RegulationStatusBadge status={regulation.status} />
          {regulation.isDemo && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-300">
              <FlaskConical className="h-3 w-3" />
              Sample — not a real regulation
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          {regulation.title}
        </h1>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
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
        <p className="mt-4 text-[16px] leading-relaxed text-zinc-300">{regulation.description}</p>
        {regulation.isDemo && (
          <p className="mt-4 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200">
            This is a sample placeholder entry for layout and development purposes only — not a real
            regulation, proposal, or government announcement.
          </p>
        )}
      </header>

      {/* Event timeline */}
      <section className="mt-10">
        <SectionHeader title="Chronological timeline" />
        {regulation.events.length === 0 ? (
          <p className="text-sm text-muted">No timeline events recorded yet.</p>
        ) : (
          <ol className="relative space-y-6 border-l-2 border-border pl-6 sm:pl-8">
            {regulation.events.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-bg sm:-left-[38px]"
                  aria-hidden
                />
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <RegulationStatusBadge status={event.status} />
                    <span className="text-xs text-muted">
                      <time dateTime={event.date.toISOString()}>{formatDate(event.date)}</time>
                    </span>
                    {event.isDemo && (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-300">
                        Sample
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-base font-bold text-zinc-100">{event.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{event.description}</p>
                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-cyan-300"
                    >
                      Event source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Status history */}
      <section className="mt-10">
        <SectionHeader title="Status history" />
        {statusHistory.length === 0 ? (
          <p className="text-sm text-muted">No status changes recorded yet.</p>
        ) : (
          <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {statusHistory.map((entry, i) => (
              <li key={`${entry.status}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <History className="h-4 w-4 text-muted" />
                  <RegulationStatusBadge status={entry.status} />
                </span>
                <time dateTime={entry.date.toISOString()} className="text-sm text-muted">
                  {formatDate(entry.date)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Sources */}
      <section className="mt-10">
        <SectionHeader title="Sources" />
        {regulation.sources.length === 0 ? (
          <p className="text-sm text-muted">No sources recorded for this regulation yet.</p>
        ) : (
          <ul className="space-y-3">
            {regulation.sources.map((source) => (
              <li
                key={source.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                    <FileText className="h-4 w-4 shrink-0 text-accent" />
                    {source.organization?.name ?? source.orgName}
                  </p>
                  <p className="mt-1 text-sm text-muted">{source.docTitle}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
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
                <SourceLabelBadge
                  label={source.sourceType === 'OFFICIAL' ? 'OFFICIAL_SOURCE' : 'NEWS_REPORT'}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
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
    </div>
  );
}
