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
import type { AuthorRow } from '@/components/admin/types';

function asList(data: AuthorRow[] | { items: AuthorRow[] }): AuthorRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function AuthorsPage() {
  const { push } = useToast();
  const [items, setItems] = useState<AuthorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AuthorRow | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AuthorRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AuthorRow[] | { items: AuthorRow[] }>('/api/admin/authors');
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load authors.');
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
    setBio('');
    setAvatarUrl('');
    setModalOpen(true);
  };

  const openEdit = (row: AuthorRow) => {
    setEditing(row);
    setName(row.name);
    setSlug(row.slug);
    setSlugTouched(true);
    setBio(row.bio ?? '');
    setAvatarUrl(row.avatarUrl ?? '');
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
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    };
    setSaving(true);
    try {
      if (editing) {
        await adminFetch(`/api/admin/authors/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Author updated.', 'success');
      } else {
        await adminFetch('/api/admin/authors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Author created.', 'success');
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
      await adminFetch(`/api/admin/authors/${deleting.id}`, { method: 'DELETE' });
      push('Author deleted.', 'success');
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
        title="Authors"
        description="Manage the writers credited on articles."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New author
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading authors…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No authors" message="Add your first author so articles can be credited." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                {a.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.avatarUrl}
                    alt={a.name}
                    className="h-11 w-11 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-accent">
                    {a.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-100">{a.name}</p>
                  <p className="truncate text-xs text-muted">/{a.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-accent"
                    aria-label={`Edit ${a.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(a)}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                    aria-label={`Delete ${a.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {a.bio ? <p className="mt-3 line-clamp-3 text-sm text-zinc-400">{a.bio}</p> : null}
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <Modal title={editing ? 'Edit author' : 'New author'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Name">
              <TextInput
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Ayesha Khan"
              />
            </Field>
            <Field label="Slug">
              <TextInput
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. ayesha-khan"
              />
            </Field>
            <Field label="Bio">
              <TextArea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short author bio" />
            </Field>
            <Field label="Avatar URL">
              <TextInput
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <GhostButton onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? 'Save changes' : 'Create author'}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete author"
          message={`Delete "${deleting.name}"? Articles by this author must be reassigned first, or the delete may fail.`}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
