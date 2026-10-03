import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black tracking-tight text-zinc-800">404</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-100">Page not found</h1>
      <p className="mt-2 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300"
        >
          Go home
        </Link>
        <Link
          href="/news"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-accent hover:text-accent"
        >
          Latest news
        </Link>
      </div>
    </div>
  );
}
