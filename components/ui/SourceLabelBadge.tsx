import { cn } from '@/lib/utils';

export type SourceLabel = 'OFFICIAL_SOURCE' | 'NEWS_REPORT' | 'ANALYSIS' | 'OPINION' | 'EDUCATIONAL';

const LABELS: Record<SourceLabel, { text: string; className: string }> = {
  OFFICIAL_SOURCE: {
    text: 'Official Source',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  NEWS_REPORT: {
    text: 'News Report',
    className: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  ANALYSIS: {
    text: 'Analysis',
    className: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  },
  OPINION: {
    text: 'Opinion',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  EDUCATIONAL: {
    text: 'Educational',
    className: 'bg-cyan-500/15 text-accent border-cyan-500/30',
  },
};

interface SourceLabelBadgeProps {
  label: SourceLabel;
  className?: string;
}

export default function SourceLabelBadge({ label, className }: SourceLabelBadgeProps) {
  const config = LABELS[label] ?? LABELS.NEWS_REPORT;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        config.className,
        className,
      )}
    >
      {config.text}
    </span>
  );
}
