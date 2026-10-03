'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { adminFetch, formatDateTime, slugify } from '@/components/admin/adminFetch';
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
  SelectInput,
  PrimaryButton,
  GhostButton,
  StatusBadge,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { RegulationRow, RegulationStatus } from '@/components/admin/types';

const STATUSES: RegulationStatus[] = [
  'PROPOSED',
  'UNDER_DISCUSSION',
  'ANNOUNCED',
  'IMPLEMENTED',
  'ACTIVE',
  'SUPERSEDED',
  'REPEALED',
];

function asList(data: RegulationRow[] | { items: RegulationRow[] }): RegulationRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function RegulationsPage() {
  const { push } = useToast();
  const [items, setItems] = useState<RegulationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RegulationStatus>('PROPOSED');
  const [institution, setInstitution] = useState('');
  const [impactArea, setImpactArea] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<RegulationRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<RegulationRow[] | { items: RegulationRow[] }>(
        '/api/admin/regulations',
      );
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load regulations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setTitle('');
    setSlug('');
    setSlugTouched(false);
    setDescription('');
    setStatus('PROPOSED');
    setInstitution('');
    setImpactArea('');
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      push('Title is required.', 'error');
      return;
    }
    if (!description.trim()) {
      push('Description is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const created = await adminFetch<{ id: string }>('/api/admin/regulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          description: description.trim(),
          status,
          institution: institution.trim() || undefined,
          impactArea: impactArea.trim() || undefined,
        }),
      });
      push('Regulation created. You can now add timeline events.', 'success');
      setModalOpen(false);
      // Jump straight into the events editor.
      window.location.href = `/admin/regulations/${created.id}`;
    } catch (e) {
      push(e instanceof Error ? e.message : 'Create failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/regulations/${deleting.id}`, { method: 'DELETE' });
      push('Regulation deleted.', 'success');
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
        title="Regulations"
        description="Track regulatory developments and their timelines."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New regulation
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading regulations…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No regulations" message="Add the first regulatory item to track." />
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/regulations/${r.id}`}
                  className="font-semibold text-zinc-100 hover:text-accent"
                >
                  {r.title}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <StatusBadge status={r.status} />
                  {r.institution ? <span>{r.institution}</span> : null}
                  {r.impactArea ? <span>· {r.impactArea}</span> : null}
                  {r.createdAt ? <span>· {formatDateTime(r.createdAt)}</span> : null}
                </p>
              </div>
              <div className="flex gap-1">
                <Link
                  href={`/admin/regulations/${r.id}`}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-accent"
                  aria-label={`Edit ${r.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleting(r)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                  aria-label={`Delete ${r.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <Modal title="New regulation" onClose={() => setModalOpen(false)} wide>
          <div className="space-y-4">
            <Field label="Title">
              <TextInput
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. SBP Digital Asset Framework 2026"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Slug">
                <TextInput
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="auto-generated"
                />
              </Field>
              <Field label="Status">
                <SelectInput value={status} onChange={(e) => setStatus(e.target.value as RegulationStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <Field label="Description">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this regulation is about"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Institution">
                <TextInput
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. State Bank of Pakistan"
                />
              </Field>
              <Field label="Impact area">
                <TextInput
                  value={impactArea}
                  onChange={(e) => setImpactArea(e.target.value)}
                  placeholder="e.g. Exchanges"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <GhostButton onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={() => void handleCreate()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create & add events
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete regulation"
          message={`Delete "${deleting.title}" and its timeline events? This cannot be undone.`}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
