'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'web3pk-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      /* storage unavailable — just hide */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border border-border glass p-4 shadow-2xl sm:left-auto sm:right-6 sm:w-[420px]"
    >
      <div className="flex items-start gap-3">
        <p className="text-sm text-zinc-300">
          We use cookies to improve your experience and analyse traffic. Read our{' '}
          <Link href="/cookies" className="text-accent underline underline-offset-2 hover:text-accentBlue">
            Cookie Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="ml-auto shrink-0 rounded-md p-1 text-muted hover:text-zinc-100"
          aria-label="Dismiss cookie notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-border px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-accent"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
