import type { Metadata } from 'next';
import Link from 'next/link';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'About Web3 Pakistan — Pakistan\'s Web3 & Crypto Intelligence Hub. Blockchain. Crypto. Regulation. Pakistan.',
};

export default function AboutPage() {
  return (
    <ProsePage
      title="About Web3 Pakistan"
      subtitle="Pakistan's Web3 & Crypto Intelligence Hub"
    >
      <p>
        <strong className="text-zinc-100">Web3 Pakistan</strong> is an independent digital media
        platform covering blockchain technology, cryptocurrency markets, decentralized finance
        (DeFi), Web3 innovation, and digital-asset regulation — with a dedicated focus on
        Pakistan.
      </p>
      <p>
        Our mission is simple: give readers in Pakistan reliable, clearly-sourced intelligence on
        one of the fastest-moving sectors in the world. We track global market movements,
        explain complex technology in plain language, and follow regulatory developments that
        affect Pakistani users, builders, and businesses.
      </p>

      <h2>What we cover</h2>
      <ul>
        <li>
          <strong className="text-zinc-100">Pakistan:</strong> local adoption stories, startups,
          developer communities, and events shaping the country&apos;s Web3 ecosystem.
        </li>
        <li>
          <strong className="text-zinc-100">Regulation:</strong> policy proposals, consultations,
          and official statements from regulators and government bodies — reported from primary
          sources, never invented.
        </li>
        <li>
          <strong className="text-zinc-100">Crypto &amp; markets:</strong> price action, market
          structure, and on-chain trends that matter to everyday readers.
        </li>
        <li>
          <strong className="text-zinc-100">Blockchain, DeFi &amp; Web3:</strong> protocols,
          infrastructure, and the ideas moving the industry forward.
        </li>
        <li>
          <strong className="text-zinc-100">AI × Web3:</strong> where artificial intelligence meets
          decentralized systems.
        </li>
        <li>
          <strong className="text-zinc-100">Guides:</strong> educational explainers that help
          newcomers understand wallets, security, and core concepts safely.
        </li>
      </ul>

      <h2>How we work</h2>
      <p>
        Every article carries a <strong className="text-zinc-100">source label</strong> —
        Official Source, News Report, Analysis, Opinion, or Educational — so you always know what
        kind of content you&apos;re reading. Our standards are documented in our{' '}
        <Link href="/editorial-policy">Editorial Policy</Link>, and when we get something wrong
        we correct it openly under our <Link href="/corrections-policy">Corrections Policy</Link>.
      </p>

      <h2>Independence</h2>
      <p>
        Web3 Pakistan is editorially independent. Sponsored content is always clearly labeled, and
        advertising never influences our reporting. See <Link href="/advertise">Advertise</Link>{' '}
        for partnership inquiries.
      </p>

      <h2>Get in touch</h2>
      <p>
        Tips, feedback, or corrections? Reach us via the{' '}
        <Link href="/contact">Contact page</Link>. For a daily summary of the biggest stories,
        join our <Link href="/newsletter">newsletter</Link>.
      </p>
    </ProsePage>
  );
}
