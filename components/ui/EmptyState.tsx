import { Newspaper } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-muted">
        <Newspaper className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
    </div>
  );
}
