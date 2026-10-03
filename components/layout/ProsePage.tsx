import type { ReactNode } from 'react';

interface ProsePageProps {
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}

/** Consistent shell for static/legal content pages. */
export default function ProsePage({ title, subtitle, updated, children }: ProsePageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
        {updated && <p className="mt-2 text-xs uppercase tracking-widest text-muted">Last updated: {updated}</p>}
      </header>
      <div className="space-y-6 text-[15px] leading-relaxed text-zinc-300 [&>h2]:pt-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-zinc-100 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6 [&>p>a]:text-accent [&>p>a]:underline [&>p>a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
