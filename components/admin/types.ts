/** Shared response/row shapes for the /api/admin/* contracts (WORKER E owns UI only). */

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  viewCount: number;
  category: { name: string };
  author: { name: string };
}

export interface ArticleListResponse {
  articles: ArticleRow[];
  totalPages: number;
}

/** Full article detail used by the editor (GET /api/admin/articles/[id]). */
export interface ArticleDetail extends ArticleRow {
  subtitle: string | null;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  categoryId: string;
  authorId: string;
  sourceLabel: string;
  scheduledAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  tagIds?: string[];
  tags?: { id: string }[];
}

export interface ArticlePayload {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  categoryId: string;
  authorId: string;
  status: ArticleStatus;
  scheduledAt?: string;
  isFeatured?: boolean;
  sourceLabel?: string;
  tagIds: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { articles?: number };
}

export type RegulationStatus =
  | 'PROPOSED'
  | 'UNDER_DISCUSSION'
  | 'ANNOUNCED'
  | 'IMPLEMENTED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'REPEALED';

export interface RegulationEvent {
  id?: string;
  date: string;
  title: string;
  description: string;
  status: RegulationStatus;
  sourceUrl?: string;
}

export interface RegulationRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: RegulationStatus;
  institution?: string | null;
  impactArea?: string | null;
  createdAt?: string;
}

export interface BreakingRow {
  id: string;
  text: string;
  url?: string | null;
  priority: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
}

export interface AuthorRow {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface MediaRow {
  id: string;
  url: string;
  alt?: string | null;
}

export interface SubscriberRow {
  id: string;
  email: string;
  name?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CommentRow {
  id: string;
  content: string;
  status: CommentStatus;
  article: { title: string; slug: string };
  user: { name: string | null; email: string };
  createdAt: string;
}

export interface SettingRow {
  key: string;
  value: string;
}

export interface AdPlacementRow {
  id: string;
  slot: string;
  isActive: boolean;
}

export interface StatsResponse {
  totalArticles: number;
  published: number;
  drafts: number;
  totalViews: number;
  subscribers: number;
  todayArticles: number;
}

export interface TagRow {
  id: string;
  name: string;
  slug: string;
}
