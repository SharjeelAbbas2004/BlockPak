'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, AlertCircle, Pencil } from 'lucide-react';

export default function ProfileForm({ initialName }: { initialName: string | null }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(initialName ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || pending) return;
    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = (await res.json()) as { user?: { name: string | null }; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not update your name.');
      setSaved(data.user?.name ?? trimmed);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your name.');
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-zinc-100">{saved || '—'}</p>
        <button
          type="button"
          onClick={() => {
            setName(saved);
            setError('');
            setEditing(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit name
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-300">Display name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={100}
          required
          autoFocus
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || name.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setName(saved);
            setError('');
            setEditing(false);
          }}
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted transition-colors hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
