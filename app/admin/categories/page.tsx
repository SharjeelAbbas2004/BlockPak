'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { adminFetch, slugify } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  EmptyList,
  Modal,
  ConfirmDialog,
  Field,
  TextInput,
  TextArea,
  PrimaryButton,
  GhostButton,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { CategoryRow } from '@/components/admin/types';

function asList(data: CategoryRow[] | { items: CategoryRow[] }): CategoryRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function CategoriesPage() {
  const { push } = useToast();
  const [items, setItems] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<CategoryRow[] | { items: CategoryRow[] }>(
        '/api/admin/categories',
      );
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setSlugTouched(false);
    setDescription('');
    setModalOpen(true);
  };

  const openEdit = (row: CategoryRow) => {
    setEditing(row);
    setName(row.name);
    setSlug(row.slug);
    setSlugTouched(true);
    setDescription(row.description ?? '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      push('Name is required.', 'error');
      return;
    }
    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || undefined,
    };
    setSaving(true);
    try {
      if (editing) {
        await adminFetch(`/api/admin/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Category updated.', 'success');
      } else {
        await adminFetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Category created.', 'success');
      }
      setModalOpen(false);
      void load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/categories/${deleting.id}`, { method: 'DELETE' });
      push('Category deleted.', 'success');
      setDeleting(null);
      void load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Delete failed.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organize articles into topic categories."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New category
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading categories…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No categories" message="Create your first category to organize articles." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Articles</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-zinc-100">{c.name}</td>
                  <td className="px-5 py-3 text-muted">/{c.slug}</td>
                  <td className="px-5 py-3 text-zinc-300">{c._count?.articles ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-accent"
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(c)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen ? (
        <Modal title={editing ? 'Edit category' : 'New category'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Name">
              <TextInput
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. DeFi"
              />
            </Field>
            <Field label="Slug">
              <TextInput
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. defi"
              />
            </Field>
            <Field label="Description">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this category covers"
              />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <GhostButton onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? 'Save changes' : 'Create category'}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete category"
          message={`Delete the category "${deleting.name}"? Articles in it must be recategorized first, or the delete may fail.`}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
