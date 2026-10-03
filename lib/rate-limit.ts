/**
 * In-memory token-bucket rate limiter.
 *
 * Keeps per-key counters in a Map so it is dependency-free and works without
 * Redis. On multi-instance / serverless deploys each instance keeps its own
 * buckets, so treat this as a best-effort abuse guard — move to a shared
 * store (Upstash/Redis) before launch if you need exact limits.
 *
 * Returns `true` when the call is ALLOWED (a token was consumed), `false`
 * when the caller is over the limit.
 */
interface Bucket {
  tokens: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Prune expired buckets when the map grows too large. */
function prune(now: number): void {
  buckets.forEach((bucket, key) => {
    if (now >= bucket.resetAt) buckets.delete(key);
  });
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { tokens: 1, resetAt: now + windowMs };
    buckets.set(key, bucket);
    if (buckets.size > 10_000) prune(now);
    return true;
  }

  if (bucket.tokens >= limit) return false;
  bucket.tokens += 1;
  return true;
}

/**
 * Derive a rate-limit key for an HTTP request. Prefers the client's IP from
 * common proxy headers, falling back to a constant for unknown callers.
 */
export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return `${scope}:${ip}`;
}
