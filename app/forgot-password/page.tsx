'use client';

import { useState, type FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (res.status === 503 && data.error === 'Email service not configured') {
        throw new Error(
          'Password reset emails are not set up yet. Please contact the site administrator.',
        );
      }
      if (!res.ok) throw new Error(data.error ?? 'Could not process your request.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process your request.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <h1 className="mt-3 text-xl font-extrabold text-zinc-100">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for <span className="text-zinc-200">{email}</span>, a password
          reset link has been sent. The link expires in 1 hour.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-zinc-100">
        <KeyRound className="h-6 w-6 text-accent" /> Forgot password
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter your account email and we will send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-surface/60 p-6">
        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
