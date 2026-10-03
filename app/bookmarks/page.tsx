import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Bookmark } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BookmarksList, { type SavedArticle } from '@/components/user/BookmarksList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Your saved articles' };

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?callbackUrl=/bookmarks');

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      article: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          imageUrl: true,
          publishedAt: true,
          readingMinutes: true,
          sourceLabel: true,
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
      },
    },
  });

  const initial: SavedArticle[] = bookmarks.map((b) => ({
    ...b.article,
    publishedAt: b.article.publishedAt ?? b.createdAt,
    savedAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-zinc-100">
        <Bookmark className="h-6 w-6 text-accent" /> Saved articles
        {initial.length > 0 && (
          <span className="text-sm font-medium text-muted">({initial.length})</span>
        )}
      </h1>
      <p className="mt-2 text-sm text-muted">Stories you saved for later.</p>

      <div className="mt-6">
        <BookmarksList initial={initial} />
      </div>
    </div>
  );
}
