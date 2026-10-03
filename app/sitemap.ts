import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web3pakistan.pk';
  try {
    return new URL(raw).origin;
  } catch {
    return 'https://web3pakistan.pk';
  }
}

const STATIC_PATHS = [
  '/',
  '/news',
  '/pakistan',
  '/regulation',
  '/crypto',
  '/blockchain',
  '/defi',
  '/web3',
  '/ai-web3',
  '/guides',
  '/about',
  '/contact',
  '/newsletter',
  '/disclaimer',
  '/privacy',
  '/terms',
  '/cookies',
  '/editorial-policy',
  '/corrections-policy',
  '/advertise',
  '/careers',
  '/login',
  '/register',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      take: 5000,
      orderBy: { publishedAt: 'desc' },
    });

    const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticEntries, ...articleEntries];
  } catch {
    // Database unavailable (e.g. during early setup) — return static paths only.
    return staticEntries;
  }
}
