'use client';

import { useEffect, useRef } from 'react';

/** Fires a one-shot view-recording POST for the article on mount. */
export default function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, { method: 'POST' }).catch(() => {
      // View tracking is best-effort; never disturb the reader.
    });
  }, [slug]);

  return null;
}
