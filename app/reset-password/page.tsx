'use client';

import { useState, type FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
        <h1 className="mt-3 text-xl font-extrabold text-zinc-100">Invalid reset link</h1>
        <p className="mt-2 text-sm text-muted">
          This password reset link is missing or malformed.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black hover:bg-cyan-300"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not reset your password.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset your password.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <h1 className="mt-3 text-xl font-extrabold text-zinc-100">Password reset</h1>
        <p className="mt-2 text-sm text-muted">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black hover:bg-cyan-300"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-zinc-100">
        <KeyRound className="h-6 w-6 text-accent" /> Set a new password
      </h1>
      <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-surface/60 p-6">
        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            className={inputClass}
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
