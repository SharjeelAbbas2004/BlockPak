import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from './SearchClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Web3 Pakistan stories by keyword, section, and date.',
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="inline-block h-8 w-1.5 rounded-full bg-accent" aria-hidden />
          Search
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Search every published story — filter by section, sort, and date range.
        </p>
      </header>
      <Suspense fallback={<p className="text-muted">Loading search…</p>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
