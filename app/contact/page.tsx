'use client';

import { useState, type FormEvent } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setMessage(payload.error ?? 'Something went wrong. Please try again later.');
        return;
      }
      setStatus('sent');
      setMessage('Thanks — your message has been received. We aim to reply within 2 business days.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Could not send your message. Please check your connection and try again.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">Contact Us</h1>
      <p className="mt-3 text-lg text-muted">
        News tips, feedback, corrections, or partnership inquiries — we read everything.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-border bg-surface/60 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">Name</span>
            <input name="name" required minLength={2} placeholder="Your name" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">Email</span>
            <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Subject</span>
          <input name="subject" required minLength={3} placeholder="What is this about?" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Message</span>
          <textarea
            name="message"
            required
            minLength={10}
            rows={5}
            placeholder="Write your message…"
            className={inputClass}
          />
        </label>

        {status === 'sent' && (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}
          </p>
        )}
        {status === 'error' && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-border bg-surface/60 p-6 text-sm text-muted">
        <h2 className="text-base font-bold text-zinc-100">Other ways to reach us</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Corrections: flag any error via this form with the subject “Correction”.</li>
          <li>Press &amp; partnerships: use the subject “Partnership”.</li>
          <li>Anonymous tips: you may omit your real name — we protect sources.</li>
        </ul>
      </div>
    </div>
  );
}
