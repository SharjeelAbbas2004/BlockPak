import type { Metadata } from 'next';
import CategoryArchive from '@/components/sections/CategoryArchive';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blockchain',
  description: 'Blockchain technology news — protocols, infrastructure, upgrades, and on-chain innovation.',
};

export default function BlockchainPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  return (
    <CategoryArchive
      slug="blockchain"
      title="Blockchain"
      description="Protocols, network upgrades, infrastructure, and the technology moving blockchains forward."
      page={page}
    />
  );
}
