import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

export const subscriberSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  name: z.string().min(2).optional(),
});

export const breakingNewsSchema = z.object({
  text: z.string().min(5, 'Breaking news text must be at least 5 characters'),
  url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export const regulationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  status: z.enum([
    'PROPOSED',
    'UNDER_DISCUSSION',
    'ANNOUNCED',
    'IMPLEMENTED',
    'ACTIVE',
    'SUPERSEDED',
    'REPEALED',
  ]),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
});

export const alertPrefsSchema = z.object({
  sbpUpdates: z.boolean(),
  secpUpdates: z.boolean(),
  governmentPolicy: z.boolean(),
  taxDevelopments: z.boolean(),
  digitalAssetRegulation: z.boolean(),
  generalCryptoNews: z.boolean(),
});

export const preferencesSchema = z.object({
  newsletterOptIn: z.boolean(),
  alertPrefs: alertPrefsSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type SubscriberInput = z.infer<typeof subscriberSchema>;
export type BreakingNewsInput = z.infer<typeof breakingNewsSchema>;
export type RegulationInput = z.infer<typeof regulationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/* ------------------------- Admin-side schemas ------------------------- */

/** Article create payload for /api/admin/articles (base articleSchema + admin-only fields). */
export const adminArticleSchema = articleSchema.extend({
  authorId: z.string().min(1, 'Author is required'),
  subtitle: z.string().max(300).optional(),
  imageUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  readingMinutes: z.number().int().min(1).max(120).optional(),
  sourceLabel: z
    .enum(['OFFICIAL_SOURCE', 'NEWS_REPORT', 'ANALYSIS', 'OPINION', 'EDUCATIONAL'])
    .optional(),
  tagIds: z.array(z.string().min(1)).max(20).optional(),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(320).optional(),
  canonicalUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

/** Article update payload — all fields optional. */
export const adminArticleUpdateSchema = adminArticleSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
  description: z.string().max(500).optional(),
});

export const authorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export const tagSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
});

export const regulationEventSchema = z.object({
  date: z.string().datetime('Enter a valid ISO date'),
  title: z.string().min(3, 'Event title must be at least 3 characters'),
  description: z.string().min(10, 'Event description must be at least 10 characters'),
  status: z.enum([
    'PROPOSED',
    'UNDER_DISCUSSION',
    'ANNOUNCED',
    'IMPLEMENTED',
    'ACTIVE',
    'SUPERSEDED',
    'REPEALED',
  ]),
  sourceUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export const adminRegulationSchema = regulationSchema.extend({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  institution: z.string().max(200).optional(),
  impactArea: z.string().max(200).optional(),
  events: z.array(regulationEventSchema).max(100).optional(),
});

export const adminRegulationUpdateSchema = adminRegulationSchema.partial();

export const adminBreakingSchema = breakingNewsSchema.extend({
  priority: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const mediaSchema = z.object({
  url: z.string().url('Enter a valid URL'),
  alt: z.string().max(200).optional(),
});

export const settingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100),
  value: z.string(),
});

export const commentStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

export const adUpdateSchema = z.object({
  isActive: z.boolean(),
});

export const articleQuerySchema = z.object({
  category: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  featured: z.enum(['true', 'false']).optional(),
  status: z.enum(['published', 'draft', 'scheduled', 'all']).optional(),
});

export type AdminArticleInput = z.infer<typeof adminArticleSchema>;
export type AdminArticleUpdateInput = z.infer<typeof adminArticleUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type AdminRegulationInput = z.infer<typeof adminRegulationSchema>;
export type AdminBreakingInput = z.infer<typeof adminBreakingSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type SettingInput = z.infer<typeof settingSchema>;
export type CommentStatusInput = z.infer<typeof commentStatusSchema>;
