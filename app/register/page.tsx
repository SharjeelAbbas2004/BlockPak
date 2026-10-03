'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? 'Registration failed. Please try again.');
        setPending(false);
        return;
      }
      router.push('/login?registered=1');
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
      setPending(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        Bookmark articles, join discussions, and manage your newsletter preferences.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-surface/60 p-6">
        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Name</span>
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
            autoComplete="name"
          />
        </label>
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
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Password</span>
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
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? 'Creating account…' : 'Create account'}
        </button>
        <p className="flex items-start gap-2 text-xs text-muted">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          By registering you agree to our <Link href="/terms" className="text-accent hover:underline">Terms of Use</Link> and <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
