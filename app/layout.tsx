import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MarketTicker from '@/components/tickers/MarketTicker';
import BreakingNewsBar from '@/components/tickers/BreakingNewsBar';
import CookieBanner from '@/components/ui/CookieBanner';
import SessionProvider from '@/components/providers/SessionProvider';
import { getMarketOverview } from '@/lib/services/market';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteUrl = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web3pakistan.pk');
  } catch {
    return new URL('https://web3pakistan.pk');
  }
})();

const SITE_TITLE = "Web3 Pakistan — Pakistan's Web3 & Crypto Intelligence Hub";
const SITE_DESCRIPTION =
  'Stay updated with the latest developments in blockchain, cryptocurrency, Web3, markets, and crypto regulation in Pakistan.';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: SITE_TITLE,
    template: '%s | Web3 Pakistan',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Web3 Pakistan',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const market = await getMarketOverview();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <BreakingNewsBar />
            <Navbar />
            <MarketTicker items={market} />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
            <CookieBanner />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
