import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web3pakistan.pk';
  let origin = 'https://web3pakistan.pk';
  try {
    origin = new URL(raw).origin;
  } catch {
    /* keep default */
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${origin}/sitemap.xml`,
  };
}
