'use client';

import Link from 'next/link';
import { Menu, Search, User, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchModal from '@/components/ui/SearchModal';
import MobileNav from './MobileNav';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Latest News', href: '/news' },
  { label: 'Pakistan', href: '/pakistan' },
  { label: 'Regulation', href: '/regulation' },
  { label: 'Crypto', href: '/crypto' },
  { label: 'Blockchain', href: '/blockchain' },
  { label: 'DeFi', href: '/defi' },
  { label: 'Web3', href: '/web3' },
  { label: 'AI × Web3', href: '/ai-web3' },
  { label: 'Markets', href: '/markets' },
  { label: 'Guides', href: '/guides' },
  { label: 'About', href: '/about' },
];

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Web3 Pakistan home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accentBlue text-sm font-black text-black">
        W3
      </span>
      <span className="text-lg font-extrabold tracking-tight text-zinc-100">
        Web3 <span className="text-accent">Pakistan</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-zinc-300 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Wordmark />

          <nav className="ml-4 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-zinc-300 transition-colors hover:border-accent hover:text-accent"
              aria-label="Search"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <ThemeToggle />

            <Link
              href="/newsletter"
              className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 sm:inline-flex"
            >
              Subscribe
            </Link>

            {status === 'authenticated' ? (
              <div className="hidden items-center gap-1 sm:flex">
                {session?.user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-zinc-300 transition-colors hover:border-accent hover:text-accent"
                    aria-label="Admin dashboard"
                    title="Admin dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400"
                  aria-label="Sign out"
                  title={`Sign out (${session.user?.email ?? 'user'})`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border text-zinc-300 transition-colors hover:border-accent hover:text-accent sm:inline-flex"
                aria-label="Sign in"
                title="Sign in"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
