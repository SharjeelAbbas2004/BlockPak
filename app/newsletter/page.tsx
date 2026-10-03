import type { Metadata } from 'next';
import { Mail, Zap, ShieldCheck } from 'lucide-react';
import SubscribeForm from '@/components/newsletter/SubscribeForm';

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Subscribe to the Web3 Pakistan Daily Brief — the biggest blockchain, crypto, and regulation stories, every morning.',
};

const PERKS = [
  {
    Icon: Zap,
    title: 'Daily Brief',
    desc: 'The 5 stories that matter, summarized in under 3 minutes — in your inbox every morning.',
  },
  {
    Icon: Mail,
    title: 'Pakistan-first lens',
    desc: 'Global crypto news filtered for what actually affects Pakistani readers, builders, and businesses.',
  },
  {
    Icon: ShieldCheck,
    title: 'No spam, ever',
    desc: 'One email a day. No selling your data, no sponsored blasts disguised as news.',
  },
];

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
          The Web3 Pakistan <span className="text-accent">Daily Brief</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
          Blockchain. Crypto. Regulation. Pakistan. — distilled into one sharp email, every morning.
        </p>
      </div>

      <div className="mt-8">
        <SubscribeForm />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {PERKS.map(({ Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-surface/60 p-5">
            <Icon className="h-6 w-6 text-accent" />
            <h2 className="mt-3 text-sm font-bold text-zinc-100">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
