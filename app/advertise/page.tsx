import type { Metadata } from 'next';
import Link from 'next/link';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Advertise',
  description: 'Advertise with Web3 Pakistan — reach Pakistan\'s Web3 and crypto audience.',
};

const FORMATS = [
  {
    name: 'Homepage & category placements',
    desc: 'High-visibility slots across the homepage and section pages, clearly separated from editorial content.',
  },
  {
    name: 'Sponsored articles',
    desc: 'In-depth branded content written to our editorial standards and always labeled “Sponsored”.',
  },
  {
    name: 'Newsletter sponsorship',
    desc: 'Your message in front of our most engaged readers — the Daily Brief audience.',
  },
  {
    name: 'Event & community partnerships',
    desc: 'Co-branded coverage of meetups, hackathons, and conferences in Pakistan’s Web3 scene.',
  },
];

export default function AdvertisePage() {
  return (
    <ProsePage
      title="Advertise with Web3 Pakistan"
      subtitle="Reach Pakistan's most focused Web3 and crypto audience."
    >
      <p>
        Web3 Pakistan readers are builders, traders, students, and professionals following
        blockchain and digital assets closely. If your product serves this audience, we offer
        advertising formats that respect readers and perform for brands.
      </p>

      <h2>Formats</h2>
      <div className="space-y-4">
        {FORMATS.map((f) => (
          <div key={f.name} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="!pt-0 text-base font-bold text-zinc-100">{f.name}</h3>
            <p className="mt-1 text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>

      <h2>Our advertising principles</h2>
      <ul>
        <li>Advertising never influences editorial coverage — see our <Link href="/editorial-policy">Editorial Policy</Link>.</li>
        <li>All paid placements are clearly labeled; native-style ads always carry a “Sponsored” tag.</li>
        <li>We do not run ads for scams, unlicensed investment schemes, or misleading “guaranteed returns” products.</li>
        <li>Crypto-related advertisers must comply with applicable advertising regulations.</li>
      </ul>

      <h2>Get a media kit</h2>
      <p>
        Tell us about your goals via the <Link href="/contact">Contact page</Link> with the
        subject “Advertising”, and we&apos;ll share our media kit with audience stats, formats,
        and rates.
      </p>
    </ProsePage>
  );
}
