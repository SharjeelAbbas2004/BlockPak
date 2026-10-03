'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  articleId: string;
  initialBookmarked?: boolean;
}

export default function BookmarkButton({ articleId, initialBookmarked = false }: BookmarkButtonProps) {
  const { status } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    if (status !== 'authenticated' || pending) return;
    setPending(true);
    setError(false);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as { bookmarked: boolean };
      setBookmarked(data.bookmarked);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  if (status === 'unauthenticated') {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        title="Sign in to bookmark articles"
        aria-label="Sign in to bookmark this article"
      >
        <Bookmark className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Save</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={error ? 'Could not save — please try again' : bookmarked ? 'Remove bookmark' : 'Bookmark this article'}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this article'}
      aria-pressed={bookmarked}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
        bookmarked
          ? 'border-accent bg-accent/10 text-accent'
          : error
            ? 'border-red-500/50 text-red-400'
            : 'border-border text-muted hover:border-accent hover:text-accent',
      )}
    >
      <Bookmark className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')} />
      <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}
