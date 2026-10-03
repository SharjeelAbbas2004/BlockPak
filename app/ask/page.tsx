'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircleQuestion, Send, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';

interface Citation {
  title: string;
  url: string;
}

interface AskSuccess {
  answer: string;
  citations: Citation[];
}

interface AskError {
  error: string;
}

const SUGGESTED_QUESTIONS = [
  'What is happening with crypto regulation in Pakistan?',
  'What is Bitcoin?',
  'Explain blockchain in simple words',
];

function isAskSuccess(v: unknown): v is AskSuccess {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.answer === 'string' &&
    Array.isArray(o.citations) &&
    o.citations.every(
      (c) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as Record<string, unknown>).title === 'string' &&
        typeof (c as Record<string, unknown>).url === 'string',
    )
  );
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AskSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = (await res.json()) as unknown;
      if (isAskSuccess(data)) {
        setAnswer(data);
      } else if (typeof data === 'object' && data !== null && typeof (data as AskError).error === 'string') {
        setError((data as AskError).error);
      } else {
        setError(`Request failed (status ${res.status}). Please try again.`);
      }
    } catch {
      setError('Could not reach the assistant. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <MessageCircleQuestion className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-100 sm:text-3xl">
          Ask Web3 Pakistan
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted sm:text-base">
          Ask questions about Bitcoin, blockchain, and crypto in Pakistan. AI answers are
          <span className="font-semibold text-zinc-200"> informational only</span> — educational
          content, not financial, investment, legal, or tax advice.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6">
        <label htmlFor="ask-input" className="sr-only">
          Ask a question
        </label>
        <div className="flex gap-2">
          <input
            id="ask-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is Bitcoin?"
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-zinc-100 placeholder:text-muted/70 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>
      </form>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Try asking</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuestion(q)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-accent/60 hover:text-accent"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-6 py-10 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          Thinking…
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {answer && (
        <section aria-live="polite" className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Answer</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-100 sm:text-base">
            {answer.answer}
          </p>
          {answer.citations.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Sources</h3>
              <ul className="mt-2 space-y-2">
                {answer.citations.map((c) => (
                  <li key={c.url}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Answers come from an AI assistant and may be incomplete or out of date. Verify important
        facts from official sources — see{' '}
        <Link href="/crypto" className="text-accent hover:underline">
          Crypto
        </Link>{' '}
        and{' '}
        <Link href="/pakistan" className="text-accent hover:underline">
          Pakistan
        </Link>{' '}
        coverage.
      </p>
    </main>
  );
}
