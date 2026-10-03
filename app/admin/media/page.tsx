'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Copy, ExternalLink } from 'lucide-react';
import { adminFetch } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  EmptyList,
  Modal,
  ConfirmDialog,
  Field,
  TextInput,
  PrimaryButton,
  GhostButton,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { MediaRow } from '@/components/admin/types';

function asList(data: MediaRow[] | { items: MediaRow[] }): MediaRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function MediaPage() {
  const { push } = useToast();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<MediaRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<MediaRow[] | { items: MediaRow[] }>('/api/admin/media');
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openAdd = () => {
    setUrl('');
    setAlt('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!url.trim()) {
      push('Image URL is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminFetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), alt: alt.trim() || undefined }),
      });
      push('Media item added.', 'success');
      setModalOpen(false);
      void load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async (mediaUrl: string) => {
    try {
      await navigator.clipboard.writeText(mediaUrl);
      push('URL copied to clipboard.', 'success');
    } catch {
      push('Could not copy URL.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/media/${deleting.id}`, { method: 'DELETE' });
      push('Media item deleted.', 'success');
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
        title="Media"
        description="Image URLs registered for use in articles."
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add image
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading media…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No media yet" message="Add image URLs to reuse them in articles." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="relative aspect-video bg-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt ?? ''} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-muted" title={m.alt ?? m.url}>
                  {m.alt || m.url}
                </p>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => void copyUrl(m.url)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </button>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
                    aria-label="Open image in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setDeleting(m)}
                    className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:border-red-400 hover:text-red-400"
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <Modal title="Add image" onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Image URL">
              <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Alt text" hint="Describes the image for accessibility and SEO.">
              <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Bitcoin chart" />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <GhostButton onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Add image
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete media"
          message="Remove this image from the media library? Articles already referencing the URL will keep working until the file itself is removed."
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
