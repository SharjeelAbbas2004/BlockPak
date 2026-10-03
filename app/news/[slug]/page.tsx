import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { fetchArticleBySlug, fetchCardArticles } from '@/lib/articles';
import { formatDate } from '@/lib/utils';
import SourceLabelBadge from '@/components/ui/SourceLabelBadge';
import ShareButtons from '@/components/ui/ShareButtons';
import BookmarkButton from '@/components/ui/BookmarkButton';
import NewsCard from '@/components/cards/NewsCard';
import SectionHeader from '@/components/ui/SectionHeader';
import CommentsSection from '@/components/comments/CommentsSection';
import ViewTracker from '@/components/comments/ViewTracker';

export const dynamic = 'force-dynamic';

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web3pakistan.pk';
  try {
    return new URL(raw).origin;
  } catch {
    return 'https://web3pakistan.pk';
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      ...(article.imageUrl ? { images: [{ url: article.imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

function renderParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className="text-[16px] leading-relaxed text-zinc-300">
        {p}
      </p>
    ));
}

/** Extract up to 4 takeaway sentences from the excerpt + lead paragraphs. */
function extractTakeaways(excerpt: string | null, content: string): string[] {
  const source = [excerpt, content]
    .filter((s): s is string => !!s)
    .join('\n\n');
  const takeaways: string[] = [];
  for (const part of source.split(/(?<=[.!?])\s+/)) {
    const t = part.trim();
    if (t.length > 40 && t.length < 300 && !takeaways.includes(t)) takeaways.push(t);
    if (takeaways.length >= 4) break;
  }
  return takeaways;
}

function ArticleJsonLd({ article, url }: { article: ArticleLike; url: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? undefined,
    ...(article.imageUrl ? { image: [article.imageUrl] } : {}),
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt ?? article.publishedAt).toISOString(),
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'Organization',
      name: 'Web3 Pakistan',
      url,
      logo: { '@type': 'ImageObject', url: `${url}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type ArticleLike = {
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  publishedAt: string | Date;
  updatedAt?: string | Date;
  author: { name: string };
};

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) notFound();

  const { articles: related } = await fetchCardArticles({
    categorySlug: article.category.slug,
    take: 4,
    excludeId: article.id,
  });

  const shareUrl = `${siteOrigin()}/news/${article.slug}`;
  const takeaways = extractTakeaways(article.excerpt, article.content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <ArticleJsonLd article={article} url={shareUrl} />
      <ViewTracker slug={article.slug} />
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="mx-1.5" aria-hidden>/</span>
        <Link href={`/${article.category.slug}`} className="hover:text-accent">
          {article.category.name}
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <SourceLabelBadge label={article.sourceLabel} />
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          {article.category.name}
        </span>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-zinc-100 sm:text-4xl">
        {article.title}
      </h1>
      {article.subtitle && <p className="mt-3 text-lg text-muted">{article.subtitle}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="font-medium text-zinc-300">{article.author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={new Date(article.publishedAt).toISOString()}>
            {formatDate(article.publishedAt)}
          </time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readingMinutes} min read
          </span>
        </div>
        <BookmarkButton articleId={article.id} />
      </div>

      {article.imageUrl && (
        <figure className="mt-6 overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.imageUrl} alt={article.title} className="w-full object-cover" />
        </figure>
      )}

      {takeaways.length > 0 && (
        <aside
          aria-label="Key takeaways"
          className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-5"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent">
            Key Takeaways
          </h2>
          <ul className="mt-3 space-y-2.5">
            {takeaways.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-zinc-200">
                <span aria-hidden className="mt-0.5 font-bold text-accent">▸</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="mt-6 space-y-5">{renderParagraphs(article.content)}</div>

      <div className="mt-8 border-t border-border pt-6">
        <ShareButtons title={article.title} url={shareUrl} />
      </div>

      <section className="mt-12 border-t border-border pt-8" aria-label="Comments">
        <CommentsSection articleId={article.id} articleSlug={article.slug} />
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Related stories" href={`/${article.category.slug}`} />
          <div className="grid gap-5 sm:grid-cols-2">
            {related.slice(0, 4).map((a) => (
              <NewsCard key={a.id} article={a} variant="medium" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
