/**
 * Market data service.
 *
 * TODO: wire this to CoinGecko (https://api.coingecko.com/api/v3) or
 * CoinMarketCap once an API key / rate-limit strategy is decided. Every
 * function below currently returns clearly-marked MOCK data for local
 * development and UI work.
 */

export interface MarketCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

const MOCK_COINS: MarketCoin[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 124500,
    change24h: 2.4,
    sparkline: [118, 120, 119, 121, 123, 122, 124, 123, 125, 124, 126, 124.5],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 4820,
    change24h: 3.1,
    sparkline: [46, 45, 46.5, 47, 46.8, 47.5, 48, 47.6, 48.4, 48.1, 48.6, 48.2].map(
      (v) => v * 100,
    ),
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    price: 985,
    change24h: -1.2,
    sparkline: [100, 99.5, 99.8, 99, 98.7, 99.2, 98.5, 98.9, 98.2, 98.6, 98.4, 98.5].map(
      (v) => v * 10,
    ),
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 232,
    change24h: 5.6,
    sparkline: [21, 21.4, 21.2, 21.8, 22.1, 21.9, 22.5, 22.3, 22.9, 22.7, 23.1, 23.2].map(
      (v) => v * 10,
    ),
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    price: 1.0,
    change24h: 0.01,
    sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
];

/** Returns mock market overview data. TODO: replace with live API. */
export async function getMarketOverview(): Promise<MarketCoin[]> {
  return MOCK_COINS;
}

/** Returns mock BTC dominance. TODO: replace with live API. */
export async function getBtcDominance(): Promise<number> {
  return 54.2;
}

/** Returns mock total crypto market cap in USD. TODO: replace with live API. */
export async function getTotalMarketCap(): Promise<number> {
  return 4_280_000_000_000;
}
