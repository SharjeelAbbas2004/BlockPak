/**
 * RSS / API ingestion pipeline — ARCHITECTURE STUB.
 *
 * Intended pipeline (in this order):
 *
 *   1. fetchRssSources()   — pull items from configured RSS feeds / news APIs.
 *   2. detectDuplicates()   — fingerprint by (title-simhash + url + publishedAt)
 *                             so the same story from multiple feeds is not
 *                             stored twice.
 *   3. verifySource()       — score source trust (official docs > wire news >
 *                             blogs), flag regulatory claims that need an
 *                             official source attached.
 *   4. queueForReview()     — insert DRAFT rows into the DB with a source
 *                             trail, visible in the admin review queue.
 *   5. Admin reviews and PUBLISHES manually.
 *
 * CRITICAL SAFETY RULE: the pipeline MUST NEVER auto-publish. Regulatory
 * announcements, tax rules and "ban/legalize" claims are high-stakes in
 * Pakistan's evolving crypto environment — every ingested item stays a
 * DRAFT until a human editor approves it in /admin.
 *
 * TODO: implement each function below (add `rss-parser` or a feed reader,
 * configure sources in SiteSetting or an env var, add a cron/queue runner).
 */

/** A single normalized item pulled from a feed or API source. */
export interface IngestedItem {
  /** Canonical URL of the original story. */
  url: string;
  /** Headline as published. */
  title: string;
  /** Plain-text summary/excerpt when available. */
  excerpt: string | null;
  /** Source feed identifier, e.g. "samaa-money" or "coindesk". */
  source: string;
  /** Original publication time, when the feed provides it. */
  publishedAt: Date | null;
  /** Optional lead image. */
  imageUrl: string | null;
}

/** A trust verdict for one ingested item. */
export interface SourceVerdict {
  item: IngestedItem;
  /** 0-100 trust score; regulatory claims need an OFFICIAL source. */
  trustScore: number;
  /** True when the item makes a regulatory/legal claim without an official source. */
  needsOfficialSource: boolean;
  reasons: string[];
}

/** A queued draft awaiting human review. */
export interface ReviewQueueItem extends IngestedItem {
  duplicateOfId: string | null;
  verdict: SourceVerdict;
}

/**
 * Pull raw items from configured RSS/API sources.
 * TODO: read source list from SiteSetting('ingestion.sources'), parse feeds,
 * normalize into IngestedItem[].
 */
export async function fetchRssSources(): Promise<IngestedItem[]> {
  throw new Error(
    'Ingestion pipeline not configured: connect RSS/API sources to enable fetchRssSources().',
  );
}

/**
 * Detect duplicates across newly fetched items and the existing DB.
 * TODO: implement title-simhash + URL normalization + 48h window matching.
 * Items that duplicate an existing article/draft are marked duplicateOfId.
 */
export async function detectDuplicates(
  items: IngestedItem[],
): Promise<{ unique: IngestedItem[]; duplicates: IngestedItem[] }> {
  void items;
  throw new Error('Ingestion pipeline not configured: implement detectDuplicates().');
}

/**
 * Score source trust and flag regulatory claims that lack an official
 * citation. NEVER auto-publish regulatory claims — this only produces
 * verdicts for the human reviewer.
 * TODO: maintain a source trust registry; add keyword classifiers for
 * regulatory topics (SBP, SECP, tax, ban, license...).
 */
export async function verifySource(item: IngestedItem): Promise<SourceVerdict> {
  void item;
  throw new Error('Ingestion pipeline not configured: implement verifySource().');
}

/**
 * Persist an item as a DRAFT article (never PUBLISHED) with its source
 * trail, ready for the admin review queue.
 * TODO: create Article with status=DRAFT, isDemo=false, attach Source rows.
 */
export async function queueForReview(
  item: IngestedItem,
  verdict: SourceVerdict,
): Promise<ReviewQueueItem> {
  void item;
  void verdict;
  throw new Error('Ingestion pipeline not configured: implement queueForReview().');
}
