'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Link2,
  ImagePlus,
  List,
  ListOrdered,
  Quote,
  Code2,
  Table as TableIcon,
  Eraser,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Lightbulb,
  Save,
  Loader2,
  Eye,
  PencilLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { slugify } from './adminFetch';
import { Field, TextInput, TextArea, SelectInput, PrimaryButton, Toggle } from './ui';
import type { ArticlePayload, ArticleStatus } from './types';

export interface EditorOption {
  id: string;
  name: string;
}

export interface ArticleEditorInitial {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  categoryId: string;
  authorId: string;
  status: ArticleStatus;
  scheduledAt: string;
  isFeatured: boolean;
  sourceLabel: string;
  tagIds: string[];
  seoTitle: string;
  seoDescription: string;
}

interface ArticleEditorProps {
  initial: ArticleEditorInitial;
  categories: EditorOption[];
  authors: EditorOption[];
  tags: EditorOption[];
  saving: boolean;
  saveLabel: string;
  formError: string | null;
  onSave: (payload: ArticlePayload) => void;
}

/** Basic client-side sanitization: strip scripts/styles, event handlers, javascript: URLs. */
export function sanitizeHtml(html: string): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, '');
  out = out.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(
    /(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi,
    '$1="#"',
  );
  return out;
}

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').length;
}

const SOURCE_LABELS = ['NEWS_REPORT', 'OFFICIAL_SOURCE', 'ANALYSIS', 'OPINION', 'EDUCATIONAL'];

export default function ArticleEditor({
  initial,
  categories,
  authors,
  tags,
  saving,
  saveLabel,
  formError,
  onSave,
}: ArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [html, setHtml] = useState(initial.content);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [authorId, setAuthorId] = useState(initial.authorId);
  const [status, setStatus] = useState<ArticleStatus>(initial.status);
  const [scheduledAt, setScheduledAt] = useState(initial.scheduledAt);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [sourceLabel, setSourceLabel] = useState(initial.sourceLabel || 'NEWS_REPORT');
  const [tagIds, setTagIds] = useState<string[]>(initial.tagIds);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const wordCount = useMemo(() => countWords(html), [html]);

  const focusEditor = () => editorRef.current?.focus();

  const exec = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value ?? '');
    syncFromEditor();
  };

  const syncFromEditor = () => {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const insertLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (!url) return;
    exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('Image URL (https://…)');
    if (!url) return;
    exec('insertImage', url);
  };

  const insertTable = () => {
    focusEditor();
    document.execCommand(
      'insertHTML',
      false,
      '<table class="ae-table"><tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>',
    );
    syncFromEditor();
  };

  const insertCallout = () => {
    focusEditor();
    document.execCommand(
      'insertHTML',
      false,
      '<div class="ae-callout"><p><strong>Note:</strong> callout text…</p></div><p><br></p>',
    );
    syncFromEditor();
  };

  const insertCodeBlock = () => {
    focusEditor();
    document.execCommand('insertHTML', false, '<pre class="ae-code">// code…</pre><p><br></p>');
    syncFromEditor();
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSave = () => {
    onSave({
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      subtitle: subtitle.trim() || undefined,
      excerpt: excerpt.trim(),
      content: sanitizeHtml(html),
      imageUrl: imageUrl.trim() || undefined,
      categoryId,
      authorId,
      status,
      scheduledAt: status === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      isFeatured,
      sourceLabel,
      tagIds,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    });
  };

  const toolbarButton =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-zinc-800 hover:text-zinc-100';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* -------- Editor column -------- */}
      <div className="min-w-0">
        <div className="rounded-xl border border-border bg-surface">
          {/* tabs */}
          <div className="flex items-center justify-between border-b border-border px-4">
            <div className="flex gap-1 py-2">
              <button
                type="button"
                onClick={() => setTab('edit')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  tab === 'edit' ? 'bg-zinc-800 text-zinc-100' : 'text-muted hover:text-zinc-200',
                )}
              >
                <PencilLine className="h-4 w-4" /> Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  syncFromEditor();
                  setTab('preview');
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  tab === 'preview' ? 'bg-zinc-800 text-zinc-100' : 'text-muted hover:text-zinc-200',
                )}
              >
                <Eye className="h-4 w-4" /> Preview
              </button>
            </div>
            <span className="text-xs text-muted">{wordCount} words</span>
          </div>

          {tab === 'edit' ? (
            <>
              {/* toolbar */}
              <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
                <button type="button" className={toolbarButton} title="Undo" onClick={() => exec('undo')}>
                  <Undo2 className="h-4 w-4" />
                </button>
                <button type="button" className={toolbarButton} title="Redo" onClick={() => exec('redo')}>
                  <Redo2 className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-border" />
                <button
                  type="button"
                  className={toolbarButton}
                  title="Heading 2"
                  onClick={() => exec('formatBlock', 'h2')}
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={toolbarButton}
                  title="Heading 3"
                  onClick={() => exec('formatBlock', 'h3')}
                >
                  <Heading3 className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-border" />
                <button type="button" className={toolbarButton} title="Bold" onClick={() => exec('bold')}>
                  <Bold className="h-4 w-4" />
                </button>
                <button type="button" className={toolbarButton} title="Italic" onClick={() => exec('italic')}>
                  <Italic className="h-4 w-4" />
                </button>
                <button type="button" className={toolbarButton} title="Insert link" onClick={insertLink}>
                  <Link2 className="h-4 w-4" />
                </button>
                <button type="button" className={toolbarButton} title="Insert image by URL" onClick={insertImage}>
                  <ImagePlus className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-border" />
                <button
                  type="button"
                  className={toolbarButton}
                  title="Quote"
                  onClick={() => exec('formatBlock', 'blockquote')}
                >
                  <Quote className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={toolbarButton}
                  title="Bullet list"
                  onClick={() => exec('insertUnorderedList')}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={toolbarButton}
                  title="Numbered list"
                  onClick={() => exec('insertOrderedList')}
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-border" />
                <button type="button" className={toolbarButton} title="Insert table" onClick={insertTable}>
                  <TableIcon className="h-4 w-4" />
                </button>
                <button type="button" className={toolbarButton} title="Insert code block" onClick={insertCodeBlock}>
                  <Code2 className="h-4 w-4" />
                </button>
                <button type="button" className={toolbarButton} title="Insert callout box" onClick={insertCallout}>
                  <Lightbulb className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-border" />
                <button
                  type="button"
                  className={toolbarButton}
                  title="Clear formatting"
                  onClick={() => exec('removeFormat')}
                >
                  <Eraser className="h-4 w-4" />
                </button>
              </div>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncFromEditor}
                dangerouslySetInnerHTML={{ __html: html }}
                className="ae-editor min-h-[420px] px-5 py-4 text-[15px] leading-relaxed text-zinc-100 outline-none"
                aria-label="Article content editor"
              />
            </>
          ) : (
            <div className="px-5 py-4">
              <div
                className="ae-preview min-h-[420px] text-[15px] leading-relaxed text-zinc-200"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
              />
            </div>
          )}
        </div>

        <style jsx>{`
          .ae-editor :global(h2),
          .ae-preview :global(h2) {
            font-size: 1.4rem;
            font-weight: 700;
            margin: 1.25em 0 0.5em;
          }
          .ae-editor :global(h3),
          .ae-preview :global(h3) {
            font-size: 1.15rem;
            font-weight: 700;
            margin: 1em 0 0.4em;
          }
          .ae-editor :global(p),
          .ae-preview :global(p) {
            margin: 0.6em 0;
          }
          .ae-editor :global(blockquote),
          .ae-preview :global(blockquote) {
            border-left: 3px solid #22d3ee;
            padding-left: 1em;
            margin: 1em 0;
            color: #a1a1aa;
            font-style: italic;
          }
          .ae-editor :global(ul),
          .ae-preview :global(ul) {
            list-style: disc;
            padding-left: 1.5em;
            margin: 0.6em 0;
          }
          .ae-editor :global(ol),
          .ae-preview :global(ol) {
            list-style: decimal;
            padding-left: 1.5em;
            margin: 0.6em 0;
          }
          .ae-editor :global(a),
          .ae-preview :global(a) {
            color: #22d3ee;
            text-decoration: underline;
          }
          .ae-editor :global(img),
          .ae-preview :global(img) {
            max-width: 100%;
            border-radius: 0.5rem;
            margin: 0.75em 0;
          }
          .ae-editor :global(table.ae-table),
          .ae-preview :global(table.ae-table) {
            border-collapse: collapse;
            width: 100%;
            margin: 0.75em 0;
          }
          .ae-editor :global(table.ae-table td),
          .ae-preview :global(table.ae-table td) {
            border: 1px solid #27272a;
            padding: 0.5em 0.75em;
          }
          .ae-editor :global(pre.ae-code),
          .ae-preview :global(pre.ae-code) {
            background: #09090b;
            border: 1px solid #27272a;
            border-radius: 0.5rem;
            padding: 0.9em 1em;
            overflow-x: auto;
            font-family: ui-monospace, monospace;
            font-size: 0.85rem;
            margin: 0.75em 0;
            white-space: pre-wrap;
          }
          .ae-editor :global(div.ae-callout),
          .ae-preview :global(div.ae-callout) {
            background: rgba(34, 211, 238, 0.08);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 0.75rem;
            padding: 0.25em 1em;
            margin: 0.9em 0;
          }
        `}</style>
      </div>

      {/* -------- Metadata sidebar -------- */}
      <aside className="space-y-5 rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-6 lg:self-start">
        {formError ? (
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2.5 text-sm text-red-200">
            {formError}
          </div>
        ) : null}

        <Field label="Title">
          <TextInput
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Article headline"
          />
        </Field>

        <Field label="Slug" hint="Auto-generated from the title. Edit to override.">
          <TextInput
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="article-slug"
          />
        </Field>

        <Field label="Subtitle">
          <TextInput
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Optional sub-headline"
          />
        </Field>

        <Field label="Excerpt">
          <TextArea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary shown on cards and search"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <SelectInput value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Author">
            <SelectInput value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
              <option value="">Select…</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <Field label="Tags">
          {tags.length === 0 ? (
            <p className="text-xs text-muted">No tags available.</p>
          ) : (
            <div className="max-h-36 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-bg p-2.5">
              {tags.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={tagIds.includes(t.id)}
                    onChange={() => toggleTag(t.id)}
                    className="h-4 w-4 rounded accent-cyan-400"
                  />
                  {t.name}
                </label>
              ))}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <SelectInput
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
            </SelectInput>
          </Field>
          <Field label="Source label">
            <SelectInput value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)}>
              {SOURCE_LABELS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {status === 'SCHEDULED' ? (
          <Field label="Schedule for">
            <TextInput
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </Field>
        ) : null}

        <div className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-2.5">
          <span className="text-sm font-medium text-zinc-200">Featured article</span>
          <Toggle checked={isFeatured} onChange={setIsFeatured} label="Featured article" />
        </div>

        <Field label="Cover image URL">
          <TextInput
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>

        <Field label="SEO title">
          <TextInput
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Defaults to the article title"
          />
        </Field>

        <Field label="SEO description">
          <TextArea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Meta description for search engines"
          />
        </Field>

        <PrimaryButton onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saveLabel}
        </PrimaryButton>
      </aside>
    </div>
  );
}
