import NewsCard from '@/components/cards/NewsCard';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { fetchCardArticles } from '@/lib/articles';

interface CategoryArchiveProps {
  slug: string;
  title: string;
  description: string;
  page?: number;
}

const PAGE_SIZE = 12;

export default async function CategoryArchive({ slug, title, description, page = 1 }: CategoryArchiveProps) {
  const safePage = Math.max(1, page);
  // The "news" index shows all sections; other archives filter by category slug.
  const categorySlug = slug === 'news' ? undefined : slug;
  const { articles, total } = await fetchCardArticles({
    categorySlug,
    take: PAGE_SIZE,
    skip: (safePage - 1) * PAGE_SIZE,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="inline-block h-8 w-1.5 rounded-full bg-accent" aria-hidden />
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{description}</p>
      </header>

      {articles.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} stories yet`}
          message="Our editors are working on it. Check back soon — or browse the latest news across all sections."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} variant="medium" />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} baseUrl={`/${slug}`} />
        </>
      )}
    </div>
  );
}
