'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleEditor, {
  type ArticleEditorInitial,
  type EditorOption,
} from '@/components/admin/ArticleEditor';
import { adminFetch } from '@/components/admin/adminFetch';
import { LoadingState, ErrorState } from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type {
  ArticleDetail,
  ArticlePayload,
  ArticleStatus,
  CategoryRow,
  AuthorRow,
  TagRow,
} from '@/components/admin/types';

const EMPTY_INITIAL: ArticleEditorInitial = {
  title: '',
  slug: '',
  subtitle: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  categoryId: '',
  authorId: '',
  status: 'DRAFT',
  scheduledAt: '',
  isFeatured: false,
  sourceLabel: 'NEWS_REPORT',
  tagIds: [],
  seoTitle: '',
  seoDescription: '',
};

function toEditorInitial(article: ArticleDetail): ArticleEditorInitial {
  const fromTags = article.tagIds ?? article.tags?.map((t) => t.id) ?? [];
  return {
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle ?? '',
    excerpt: article.excerpt,
    content: article.content,
    imageUrl: article.imageUrl ?? '',
    categoryId: article.categoryId,
    authorId: article.authorId,
    status: article.status as ArticleStatus,
    scheduledAt: article.scheduledAt ?? '',
    isFeatured: article.isFeatured,
    sourceLabel: article.sourceLabel ?? 'NEWS_REPORT',
    tagIds: fromTags,
    seoTitle: article.seoTitle ?? '',
    seoDescription: article.seoDescription ?? '',
  };
}

export default function ArticleForm({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = Boolean(articleId);

  const [initial, setInitial] = useState<ArticleEditorInitial | null>(isEdit ? null : EMPTY_INITIAL);
  const [categories, setCategories] = useState<EditorOption[]>([]);
  const [authors, setAuthors] = useState<EditorOption[]>([]);
  const [tags, setTags] = useState<EditorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, auths, tgs] = await Promise.all([
        adminFetch<CategoryRow[] | { items: CategoryRow[] }>('/api/admin/categories').catch(() => [] as CategoryRow[]),
        adminFetch<AuthorRow[] | { items: AuthorRow[] }>('/api/admin/authors').catch(() => [] as AuthorRow[]),
        adminFetch<TagRow[] | { items: TagRow[] }>('/api/admin/tags').catch(() => [] as TagRow[]),
      ]);
      const catList = Array.isArray(cats) ? cats : cats.items;
      const authList = Array.isArray(auths) ? auths : auths.items;
      const tagList = Array.isArray(tgs) ? tgs : tgs.items;
      setCategories(catList.map((c) => ({ id: c.id, name: c.name })));
      setAuthors(authList.map((a) => ({ id: a.id, name: a.name })));
      setTags(tagList.map((t) => ({ id: t.id, name: t.name })));

      if (articleId) {
        const article = await adminFetch<ArticleDetail>(`/api/admin/articles/${articleId}`);
        setInitial(toEditorInitial(article));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the editor.');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const validate = (payload: ArticlePayload): string | null => {
    if (!payload.title) return 'Title is required.';
    if (!payload.slug) return 'Slug is required.';
    if (!payload.excerpt) return 'Excerpt is required.';
    if (!payload.categoryId) return 'Please choose a category.';
    if (!payload.authorId) return 'Please choose an author.';
    if (payload.content.replace(/<[^>]*>/g, '').trim().length === 0) return 'Article content is empty.';
    if (payload.status === 'SCHEDULED' && !payload.scheduledAt) return 'Pick a date and time to schedule publishing.';
    return null;
  };

  const handleSave = async (payload: ArticlePayload) => {
    const problem = validate(payload);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await adminFetch(`/api/admin/articles/${articleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Article updated.', 'success');
      } else {
        await adminFetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Article created.', 'success');
      }
      router.push('/admin/articles');
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label={isEdit ? 'Loading article…' : 'Loading editor…'} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!initial) return <ErrorState message="Article not found." />;

  return (
    <ArticleEditor
      initial={initial}
      categories={categories}
      authors={authors}
      tags={tags}
      saving={saving}
      saveLabel={isEdit ? 'Save changes' : 'Create article'}
      formError={formError}
      onSave={(payload) => void handleSave(payload)}
    />
  );
}
