'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  Scale,
  Zap,
  PenLine,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Megaphone,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: Newspaper, exact: false },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen, exact: false },
  { href: '/admin/regulations', label: 'Regulations', icon: Scale, exact: false },
  { href: '/admin/breaking', label: 'Breaking News', icon: Zap, exact: false },
  { href: '/admin/authors', label: 'Authors', icon: PenLine, exact: false },
  { href: '/admin/media', label: 'Media', icon: ImageIcon, exact: false },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail, exact: false },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare, exact: false },
  { href: '/admin/ads', label: 'Ads', icon: Megaphone, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-accent/10 text-accent'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-sm font-bold text-zinc-100">Web3 Pakistan · Admin</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-zinc-800 hover:text-zinc-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
          </div>
        </div>
      ) : null}

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="border-b border-border px-4 py-5">
          <p className="text-sm font-extrabold tracking-tight text-zinc-100">Web3 Pakistan</p>
          <p className="text-xs text-muted">Admin console</p>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-muted hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-zinc-200 lg:hidden">Web3 Pakistan · Admin</p>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-400 hover:text-red-300 lg:hidden"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
