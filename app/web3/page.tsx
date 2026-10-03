import type { Metadata } from 'next';
import CategoryArchive from '@/components/sections/CategoryArchive';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Web3',
  description: 'Web3 news — decentralized apps, DAOs, NFTs, identity, and the open internet.',
};

export default function Web3Page({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  return (
    <CategoryArchive
      slug="web3"
      title="Web3"
      description="Decentralized applications, DAOs, digital identity, NFTs, and the builders of the open internet."
      page={page}
    />
  );
}
