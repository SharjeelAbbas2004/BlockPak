'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { ALERT_PREFS, type AlertPrefs } from '@/lib/preferences';

interface SettingsFormProps {
  initial: { newsletterOptIn: boolean; alertPrefs: AlertPrefs };
}

export default function SettingsForm({ initial }: SettingsFormProps) {
  const [newsletterOptIn, setNewsletterOptIn] = useState(initial.newsletterOptIn);
  const [alertPrefs, setAlertPrefs] = useState<AlertPrefs>(initial.alertPrefs);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function togglePref(key: keyof AlertPrefs) {
    setAlertPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedAt(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterOptIn, alertPrefs }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not save preferences.');
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preferences.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <section className="rounded-xl border border-border bg-surface/60 p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-zinc-100">
          <Mail className="h-4 w-4 text-accent" /> Newsletter
        </h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={newsletterOptIn}
            onChange={(e) => {
              setNewsletterOptIn(e.target.checked);
              setSavedAt(null);
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400"
          />
          <span>
            <span className="block text-sm font-medium text-zinc-200">
              Receive the Web3 Pakistan newsletter
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Weekly digest of Pakistan crypto news and regulation updates.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-xl border border-border bg-surface/60 p-5">
        <h2 className="text-base font-bold text-zinc-100">Pakistan Crypto Regulation Alerts</h2>
        <p className="mt-1 text-xs text-muted">
          Choose which regulatory topics you want to hear about. Unchecking all is the same as
          opting out of alerts.
        </p>
        <div className="mt-4 space-y-3">
          {ALERT_PREFS.map(({ key, label, description }) => (
            <label key={key} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={alertPrefs[key]}
                onChange={() => togglePref(key)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-200">{label}</span>
                <span className="mt-0.5 block text-xs text-muted">{description}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? 'Saving…' : 'Save preferences'}
        </button>
        {savedAt && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved at {savedAt}
          </p>
        )}
      </div>
    </form>
  );
}
