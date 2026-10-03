import type { Metadata } from 'next';
import Link from 'next/link';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Careers at Web3 Pakistan — join Pakistan\'s Web3 media team.',
};

const ROLES = [
  {
    title: 'Staff Writer — Crypto & Markets',
    type: 'Full-time · Remote (Pakistan)',
    desc: 'Cover daily crypto market news with speed and accuracy. You live on-chain and can explain funding rates in plain Urdu or English.',
  },
  {
    title: 'Regulation Correspondent',
    type: 'Full-time · Remote (Pakistan)',
    desc: 'Track policy, consultations, and official statements affecting digital assets. Primary-source discipline is non-negotiable.',
  },
  {
    title: 'Contributing Writers',
    type: 'Freelance · Remote',
    desc: 'Pitch us analysis, explainers, and ecosystem stories. We pay per piece and welcome new voices.',
  },
];

export default function CareersPage() {
  return (
    <ProsePage
      title="Careers"
      subtitle="Help build Pakistan's Web3 & crypto intelligence hub."
    >
      <p>
        We&apos;re a small, ambitious newsroom covering one of the most dynamic beats in
        technology. If you care about accuracy, move fast without breaking facts, and want your
        work read across Pakistan&apos;s Web3 community — we want to hear from you.
      </p>

      <h2>Open roles</h2>
      <div className="space-y-4">
        {ROLES.map((r) => (
          <div key={r.title} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="!pt-0 text-base font-bold text-zinc-100">{r.title}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-accent">{r.type}</p>
            <p className="mt-2 text-sm text-muted">{r.desc}</p>
          </div>
        ))}
      </div>

      <h2>How to apply</h2>
      <p>
        Send your CV, two relevant writing samples, and a short note on the beat you&apos;d own
        via the <Link href="/contact">Contact page</Link> with the subject “Careers — [Role
        title]”. No cover-letter essays required; show us your work.
      </p>

      <h2>What we offer</h2>
      <ul>
        <li>Remote-first work with flexible hours.</li>
        <li>Bylines on a fast-growing national platform.</li>
        <li>Editorial mentorship and a strict, fair corrections culture.</li>
      </ul>
    </ProsePage>
  );
}
