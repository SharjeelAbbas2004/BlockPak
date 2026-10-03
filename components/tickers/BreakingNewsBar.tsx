'use client';

import { useEffect, useState } from 'react';
import BreakingNews, { type BreakingNewsItem } from './BreakingNews';

/**
 * Client wrapper that loads active breaking-news items from the API and
 * renders the BreakingNews ticker. Renders nothing while loading or when
 * there is nothing to show.
 */
export default function BreakingNewsBar() {
  const [items, setItems] = useState<BreakingNewsItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/breaking-news');
        if (!res.ok) return;
        const data = (await res.json()) as { items: BreakingNewsItem[] };
        if (!cancelled && Array.isArray(data.items)) setItems(data.items);
      } catch {
        /* breaking news is non-critical — fail silently */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <BreakingNews items={items} />;
}
