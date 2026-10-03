import Link from 'next/link';
import { Twitter, Facebook, Linkedin, Send } from 'lucide-react';

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Web3 Pakistan',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Latest News', href: '/news' },
      { label: 'Pakistan', href: '/pakistan' },
      { label: 'Crypto', href: '/crypto' },
      { label: 'Blockchain', href: '/blockchain' },
      { label: 'DeFi', href: '/defi' },
      { label: 'Web3', href: '/web3' },
      { label: 'AI × Web3', href: '/ai-web3' },
    ],
  },
  {
    heading: 'Information',
    links: [
      { label: 'Regulation', href: '/regulation' },
      { label: 'Guides', href: '/guides' },
      { label: 'Daily Brief', href: '/newsletter' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const SOCIALS = [
  { label: 'X (Twitter)', href: 'https://x.com', Icon: Twitter },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { label: 'Telegram', href: 'https://t.me', Icon: Send },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="text-lg font-extrabold tracking-tight text-zinc-100">
              Web3 <span className="text-accent">Pakistan</span>
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-300">
              Pakistan&apos;s Web3 &amp; Crypto Intelligence Hub
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">
              Blockchain. Crypto. Regulation. Pakistan.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted">
            Web3 Pakistan provides educational and informational content about blockchain,
            cryptocurrency and digital assets. Nothing on this website constitutes financial,
            investment, legal or tax advice. Cryptocurrency and digital assets involve significant
            risks. Users should conduct their own research and consult qualified professionals
            where appropriate.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">© 2026 Web3 Pakistan. All rights reserved.</p>
            <div className="flex gap-4 text-xs">
              <Link href="/editorial-policy" className="text-muted hover:text-accent">
                Editorial Policy
              </Link>
              <Link href="/corrections-policy" className="text-muted hover:text-accent">
                Corrections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
