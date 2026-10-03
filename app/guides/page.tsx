import type { Metadata } from 'next';
import CategoryArchive from '@/components/sections/CategoryArchive';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Crypto and Web3 guides — learn wallets, security, DeFi, and blockchain basics safely.',
};

export default function GuidesPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  return (
    <CategoryArchive
      slug="guides"
      title="Guides"
      description="Educational explainers: wallets, security, DeFi basics, and blockchain concepts — written for newcomers, in plain language."
      page={page}
    />
  );
}
