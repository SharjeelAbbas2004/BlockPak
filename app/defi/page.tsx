import type { Metadata } from 'next';
import CategoryArchive from '@/components/sections/CategoryArchive';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DeFi',
  description: 'Decentralized finance news — protocols, yields, risks, and the future of open finance.',
};

export default function DefiPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  return (
    <CategoryArchive
      slug="defi"
      title="DeFi"
      description="Decentralized finance: protocols, liquidity, yields, hacks, and honest coverage of the risks."
      page={page}
    />
  );
}
