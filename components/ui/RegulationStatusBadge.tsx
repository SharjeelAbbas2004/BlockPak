import type { RegulationStatus } from '@prisma/client';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<RegulationStatus, { label: string; className: string }> = {
  PROPOSED: {
    label: 'Proposed',
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  UNDER_DISCUSSION: {
    label: 'Under Discussion',
    className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  },
  ANNOUNCED: {
    label: 'Announced',
    className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  IMPLEMENTED: {
    label: 'Implemented',
    className: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  SUPERSEDED: {
    label: 'Superseded',
    className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  },
  REPEALED: {
    label: 'Repealed',
    className: 'bg-red-500/15 text-red-300 border-red-500/30',
  },
};

interface RegulationStatusBadgeProps {
  status: RegulationStatus;
  className?: string;
}

export default function RegulationStatusBadge({ status, className }: RegulationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ANNOUNCED;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
