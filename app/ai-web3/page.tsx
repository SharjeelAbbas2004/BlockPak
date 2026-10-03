import type { Metadata } from 'next';
import CategoryArchive from '@/components/sections/CategoryArchive';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI × Web3',
  description: 'Where artificial intelligence meets Web3 — decentralized AI, agents, and compute.',
};

export default function AiWeb3Page({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  return (
    <CategoryArchive
      slug="ai-web3"
      title="AI × Web3"
      description="The intersection of artificial intelligence and decentralization — AI agents, decentralized compute, and data networks."
      page={page}
    />
  );
}
