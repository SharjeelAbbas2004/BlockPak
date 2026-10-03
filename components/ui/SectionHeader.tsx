import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
}

export default function SectionHeader({ title, href, linkLabel = 'View all' }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
        <span className="inline-block h-6 w-1 rounded-full bg-accent" aria-hidden />
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-cyan-300"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
