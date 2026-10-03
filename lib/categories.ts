/** Shared editorial category chips used by the homepage feed, /news, and /search. */
export interface ChipCategory {
  name: string;
  slug: string;
}

export const ARTICLE_CATEGORIES: ChipCategory[] = [
  { name: 'Pakistan', slug: 'pakistan' },
  { name: 'Crypto', slug: 'crypto' },
  { name: 'Blockchain', slug: 'blockchain' },
  { name: 'Regulation', slug: 'regulation' },
  { name: 'DeFi', slug: 'defi' },
  { name: 'Web3', slug: 'web3' },
  { name: 'AI × Web3', slug: 'ai-web3' },
  { name: 'Markets', slug: 'markets' },
];
