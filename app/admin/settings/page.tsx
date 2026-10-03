'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Loader2, Save } from 'lucide-react';
import { adminFetch } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  EmptyList,
  Modal,
  Field,
  TextInput,
  TextArea,
  PrimaryButton,
  GhostButton,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { SettingRow } from '@/components/admin/types';

function asList(data: SettingRow[] | { settings: SettingRow[] }): SettingRow[] {
  return Array.isArray(data) ? data : data.settings;
}

export default function SettingsPage() {
  const { push } = useToast();
  const [items, setItems] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<SettingRow[] | { settings: SettingRow[] }>('/api/admin/settings');
      setItems(asList(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (row: SettingRow) => {
    setEditingKey(row.key);
    setEditValue(row.value);
  };

  const saveEdit = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: editingKey, value: editValue }),
      });
      setItems((prev) => prev.map((s) => (s.key === editingKey ? { ...s, value: editValue } : s)));
      push(`Setting "${editingKey}" saved.`, 'success');
      setEditingKey(null);
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSetting = async () => {
    if (!newKey.trim()) {
      push('Key is required.', 'error');
      return;
    }
    setAdding(true);
    try {
      await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim(), value: newValue }),
      });
      push(`Setting "${newKey.trim()}" saved.`, 'success');
      setNewKey('');
      setNewValue('');
      void load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Site-wide key/value configuration."
      />

      {loading ? (
        <LoadingState label="Loading settings…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">Add setting</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Key">
                <TextInput
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. site_tagline"
                />
              </Field>
              <Field label="Value">
                <TextInput
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Setting value"
                />
              </Field>
              <div className="flex items-end">
                <PrimaryButton onClick={() => void addSetting()} disabled={adding} className="w-full sm:w-auto">
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Add
                </PrimaryButton>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyList title="No settings" message="Add your first site setting above." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-medium">Key</th>
                    <th className="px-5 py-3 font-medium">Value</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.key} className="border-b border-border/60 align-top last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-[13px] font-medium text-accent">
                        {s.key}
                      </td>
                      <td className="max-w-[420px] px-5 py-3">
                        <p className="break-words text-sm text-zinc-300">{s.value}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => startEdit(s)}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-zinc-800 hover:text-accent"
                            aria-label={`Edit ${s.key}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editingKey ? (
        <Modal title={`Edit setting: ${editingKey}`} onClose={() => setEditingKey(null)}>
          <div className="space-y-4">
            <Field label="Value">
              <TextArea value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <GhostButton onClick={() => setEditingKey(null)} disabled={saving}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={() => void saveEdit()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save setting
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
