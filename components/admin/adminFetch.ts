'use client';

export class AdminApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminApiError';
  }
}

/**
 * Typed fetch for admin API routes. Throws AdminApiError with the server's
 * error message (or status) when res.ok is false, so every page can show an
 * error state instead of failing silently.
 */
export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: unknown; message?: unknown };
      if (typeof body.error === 'string' && body.error.length > 0) {
        message = body.error;
      } else if (typeof body.message === 'string' && body.message.length > 0) {
        message = body.message;
      }
    } catch {
      /* keep the status-based message */
    }
    throw new AdminApiError(message);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  const text = await res.text();
  if (text.length === 0) {
    return undefined as unknown as T;
  }
  return JSON.parse(text) as T;
}

/** Turn a title into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Format an ISO date string for a datetime-local input. */
export function toDateTimeLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Format a date for display in tables. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
