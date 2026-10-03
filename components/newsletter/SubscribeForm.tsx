'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

export default function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const payload = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setStatus('error');
        setMessage(payload.error ?? 'Subscription failed. Please try again.');
        return;
      }
      setStatus('done');
      setMessage(payload.message ?? 'Subscribed successfully.');
      setEmail('');
      setName('');
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Please check your connection and try again.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? 'space-y-3' : 'space-y-4 rounded-xl border border-border bg-surface/60 p-6 sm:p-8'}
    >
      {!compact && (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold text-zinc-100">Get the Daily Brief</h2>
        </div>
      )}

      <div className={compact ? 'grid gap-3' : 'grid gap-4 sm:grid-cols-2'}>
        {!compact && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">Name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none"
              autoComplete="name"
            />
          </label>
        )}
        <label className={compact ? 'block' : 'block sm:col-span-2'}>
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none"
            autoComplete="email"
          />
        </label>
      </div>

      {status === 'done' && (
        <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}
        </p>
      )}
      {status === 'error' && (
        <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
      >
        {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'sending' ? 'Subscribing…' : 'Subscribe free'}
      </button>
      <p className="text-xs text-muted">One email per day. Unsubscribe anytime.</p>
    </form>
  );
}
