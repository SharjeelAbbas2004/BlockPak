'use client';

import Link from 'next/link';
import { X, Home } from 'lucide-react';
import { useEffect } from 'react';
import { NAV_LINKS } from './Navbar';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', !open && 'pointer-events-none')} aria-hidden={!open}>
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={cn(
          'absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-surface shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-base font-extrabold tracking-tight text-zinc-100">
            Web3 <span className="text-accent">Pakistan</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:text-zinc-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-accent"
                  tabIndex={open ? 0 : -1}
                >
                  {link.label === 'Home' && <Home className="h-4 w-4 text-muted" />}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/newsletter"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300"
            tabIndex={open ? 0 : -1}
          >
            Subscribe to Newsletter
          </Link>
        </div>
      </aside>
    </div>
  );
}
