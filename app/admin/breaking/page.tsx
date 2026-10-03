'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { adminFetch, formatDateTime, toDateTimeLocalInput } from '@/components/admin/adminFetch';
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
  Toggle,
  StatusBadge,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { BreakingRow } from '@/components/admin/types';

function asList(data: BreakingRow[] | { items: BreakingRow[] }): BreakingRow[] {
  return Array.isArray(data) ? data : data.items;
}

export default function BreakingPage() {
  const { push } = useToast();
  const [items, setItems] = useState<BreakingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BreakingRow | null>(null);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<BreakingRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<BreakingRow[] | { items: BreakingRow[] }>('/api/admin/breaking');
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load breaking news.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setText('');
    setUrl('');
    setPriority('0');
    setIsActive(true);
    setStartsAt('');
    setEndsAt('');
    setModalOpen(true);
  };

  const openEdit = (row: BreakingRow) => {
    setEditing(row);
    setText(row.text);
    setUrl(row.url ?? '');
    setPriority(String(row.priority));
    setIsActive(row.isActive);
    setStartsAt(toDateTimeLocalInput(row.startsAt));
    setEndsAt(toDateTimeLocalInput(row.endsAt));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!text.trim()) {
      push('Text is required.', 'error');
      return;
    }
    const payload = {
      text: text.trim(),
      url: url.trim() || undefined,
      priority: Number.isNaN(parseInt(priority, 10)) ? 0 : parseInt(priority, 10),
      isActive,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
    };
    setSaving(true);
    try {
      if (editing) {
        await adminFetch(`/api/admin/breaking/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Breaking item updated.', 'success');
      } else {
        await adminFetch('/api/admin/breaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        push('Breaking item created.', 'success');
      }
      setModalOpen(false);
      void load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: BreakingRow, next: boolean) => {
    setTogglingId(row.id);
    try {
      await adminFetch(`/api/admin/breaking/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      setItems((prev) => prev.map((i) => (i.id === row.id ? { ...i, isActive: next } : i)));
      push(next ? 'Item activated.' : 'Item deactivated.', 'success');
    } catch (e) {
      push(e instanceof Error ? e.message : 'Update failed.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminFetch(`/api/admin/breaking/${deleting.id}`, { method: 'DELETE' });
      push('Breaking item deleted.', 'success');
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
        title="Breaking News"
        description="Manage the breaking-news ticker items."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New item
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading breaking news…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyList title="No breaking items" message="Add a breaking-news item for the homepage ticker." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">{item.text}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <StatusBadge status={item.isActive ? 'ACTIVE' : 'DRAFT'} />
                  <span>Priority {item.priority}</span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      Link <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                  {item.startsAt ? <span>From {formatDateTime(item.startsAt)}</span> : null}
                  {item.endsAt ? <span>Until {formatDateTime(item.endsAt)}</span> : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle
                  checked={item.isActive}
                  onChange={(next) => void toggleActive(item, next)}
                  label={`Toggle ${item.text.slice(0, 30)}`}
                />
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-accent"
                  aria-label="Edit item"
                  disabled={togglingId === item.id}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(item)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                  aria-label="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <Modal title={editing ? 'Edit breaking item' : 'New breaking item'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Text">
              <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="Breaking headline text" />
            </Field>
            <Field label="Link URL" hint="Optional article or source link.">
              <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority" hint="Higher shows first.">
                <TextInput
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </Field>
              <div className="flex items-end pb-1">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg px-3 py-2.5 w-full">
                  <span className="text-sm font-medium text-zinc-200">Active</span>
                  <Toggle checked={isActive} onChange={setIsActive} label="Active" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts at">
                <TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </Field>
              <Field label="Ends at">
                <TextInput type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <GhostButton onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? 'Save changes' : 'Create item'}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete breaking item"
          message="Permanently remove this breaking-news item from the ticker?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      ) : null}
    </div>
  );
}
