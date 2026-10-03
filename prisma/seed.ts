/**
 * Web3 Pakistan — database seed script.
 *
 * Run with:  npx tsx prisma/seed.ts
 * (DATABASE_URL must point at a reachable PostgreSQL database.)
 *
 * The script is idempotent: every write goes through `upsert` (or a
 * find-first-then-create guard), so it can be re-run safely.
 *
 * Content policy baked into this seed:
 *  - ALL seeded articles are demo content (isDemo = true) and say so.
 *  - No invented Pakistani government announcements. The only
 *    non-demo rows are the verified regulation records listed explicitly
 *    in the platform spec, and even those carry no fabricated URLs.
 */
import { PrismaClient, ArticleStatus, SourceLabel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEMO_BODY_PARAGRAPHS: string[] = [
  "This is demo content for the Web3 Pakistan platform. It exists to demonstrate layouts, typography, reading progress, and content structure during development — it is not real reporting and makes no factual claims.",
  "In a production deployment, an article in this slot would be replaced with original reporting, verified sources, and editorial review. Placeholder text like this helps the team evaluate the reading experience, article cards, and category pages before real content flows through the publishing pipeline.",
  "Web3 Pakistan is Pakistan's Web3 and crypto intelligence hub, covering blockchain technology, digital assets, market developments, and regulation with a focus on Pakistan's growing digital-asset ecosystem. Demo articles keep every template exercised while the editorial workflow is finalized.",
  "Nothing in this demo article should be treated as financial advice, legal guidance, or a factual claim about any person, company, regulator, or government action. Always do your own research and consult qualified professionals.",
];

interface ArticleSpec {
  title: string;
  excerpt: string;
  lead: string;
  categorySlug: string;
  authorSlug: string;
  tagSlugs: string[];
  sourceLabel: SourceLabel;
  readingMinutes: number;
  isFeatured: boolean;
  daysAgo: number;
}

function buildContent(lead: string): string {
  return [lead, ...DEMO_BODY_PARAGRAPHS].join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const CATEGORIES: Array<{ name: string; slug: string; description: string }> = [
  { name: "Pakistan", slug: "pakistan", description: "Web3 and crypto developments with a Pakistan focus." },
  { name: "Regulation", slug: "regulation", description: "Policy, licensing, and regulatory developments." },
  { name: "Crypto", slug: "crypto", description: "Cryptocurrency news, markets, and explainers." },
  { name: "Blockchain", slug: "blockchain", description: "Blockchain technology, protocols, and infrastructure." },
  { name: "DeFi", slug: "defi", description: "Decentralized finance protocols and trends." },
  { name: "Web3", slug: "web3", description: "The decentralized web: dApps, DAOs, identity, and culture." },
  { name: "AI × Web3", slug: "ai-web3", description: "Where artificial intelligence meets decentralized systems." },
  { name: "Markets", slug: "markets", description: "Prices, market data, and trading analysis." },
  { name: "Guides", slug: "guides", description: "How-tos and educational guides for beginners." },
];

const TAGS = [
  "bitcoin",
  "ethereum",
  "pakistan",
  "crypto-regulation",
  "sbp",
  "secp",
  "pvara",
  "stablecoins",
  "defi",
  "blockchain",
  "web3",
  "ai",
  "binance",
  "usdt",
  "solana",
  "nft",
];

const AUTHORS: Array<{ name: string; bio: string }> = [
  {
    name: "Ayesha Khan",
    bio: "Demo author. Covers crypto markets and blockchain technology for Web3 Pakistan (sample profile).",
  },
  {
    name: "Bilal Ahmed",
    bio: "Demo author. Writes explainers on DeFi, Web3, and digital-asset basics (sample profile).",
  },
  {
    name: "Danish Raza",
    bio: "Demo author. Focuses on regulation, policy, and Pakistan's digital economy (sample profile).",
  },
];

const ARTICLES: ArticleSpec[] = [
  /* ---------------- 12 general crypto news ---------------- */
  {
    title: "Bitcoin Holds Above Key Support as Weekly Trading Range Tightens",
    excerpt: "Demo article: Bitcoin consolidates in a narrowing range while traders watch for a breakout in either direction.",
    lead: "Bitcoin spent the week trading in an increasingly tight range, holding above a widely watched support zone as spot volumes cooled. Demo text: in a real edition of this story, our markets desk would quote order-book data and analyst commentary.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["bitcoin", "binance", "usdt"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 4, isFeatured: true, daysAgo: 1,
  },
  {
    title: "Ethereum Developers Confirm Next Network Upgrade Window",
    excerpt: "Demo article: core developers align on timing for Ethereum's next planned network upgrade.",
    lead: "Ethereum core developers have converged on a target window for the network's next upgrade, according to demo placeholder notes. A production version of this article would detail the included EIPs and client readiness.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["ethereum", "blockchain"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 5, isFeatured: false, daysAgo: 2,
  },
  {
    title: "Solana Sees Record Daily Active Addresses in DeFi Surge",
    excerpt: "Demo article: on-chain activity on Solana climbs as DeFi usage picks up across the ecosystem.",
    lead: "Daily active addresses on Solana touched a new high this week, driven by a pickup in decentralized exchange and lending activity. Demo text: real figures would be sourced from on-chain analytics providers.",
    categorySlug: "crypto", authorSlug: "bilal-ahmed",
    tagSlugs: ["solana", "defi"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 4, isFeatured: false, daysAgo: 3,
  },
  {
    title: "Stablecoin Volumes Climb as Traders Seek Dollar Exposure",
    excerpt: "Demo article: stablecoin transfer volumes rise, reflecting demand for dollar-denominated crypto liquidity.",
    lead: "Stablecoins continue to cement their role as crypto's settlement layer, with transfer volumes climbing for a third straight week in this demo scenario. A real report would break volumes down by chain and issuer.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["stablecoins", "usdt", "binance"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 5, isFeatured: false, daysAgo: 5,
  },
  {
    title: "Bitcoin ETFs Post Strongest Inflow Week of the Quarter",
    excerpt: "Demo article: spot bitcoin ETFs record heavy net inflows as institutional demand returns.",
    lead: "Spot bitcoin exchange-traded funds recorded their strongest week of net inflows this quarter in this demo narrative, reversing a stretch of outflows. Production copy would cite issuer-by-issuer flow data.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["bitcoin", "ethereum"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 4, isFeatured: true, daysAgo: 6,
  },
  {
    title: "Binance Expands Compliance Team Across Emerging Markets",
    excerpt: "Demo article: the world's largest exchange says it is hiring compliance staff across emerging markets.",
    lead: "Binance says it is expanding its compliance headcount across emerging markets, part of a broader industry push toward regulatory alignment. Demo text: a real article would include statements from the company and regional experts.",
    categorySlug: "crypto", authorSlug: "danish-raza",
    tagSlugs: ["binance", "crypto-regulation"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 5, isFeatured: false, daysAgo: 8,
  },
  {
    title: "DeFi Total Value Locked Rebounds Toward Yearly High",
    excerpt: "Demo article: capital returns to decentralized finance as yields stabilize and confidence improves.",
    lead: "Total value locked across DeFi protocols is climbing back toward its yearly high, led by restaking and liquid-staking categories in this demo scenario. Real coverage would name the fastest-growing protocols.",
    categorySlug: "crypto", authorSlug: "bilal-ahmed",
    tagSlugs: ["defi", "ethereum", "solana"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 6, isFeatured: false, daysAgo: 9,
  },
  {
    title: "NFT Market Shows Signs of Stabilization After Long Slump",
    excerpt: "Demo article: NFT trading volumes level out as blue-chip collections find a floor.",
    lead: "After a prolonged downturn, NFT markets are showing early signs of stabilization, with blue-chip collection floors steadying in this demo account. A production piece would include marketplace data and creator interviews.",
    categorySlug: "crypto", authorSlug: "bilal-ahmed",
    tagSlugs: ["nft", "ethereum"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 4, isFeatured: false, daysAgo: 11,
  },
  {
    title: "Analysts Debate the Next Bitcoin Halving Supply Shock",
    excerpt: "Demo article: market watchers disagree on how much the next halving will move bitcoin's price.",
    lead: "With the next bitcoin halving on the horizon, analysts are split on whether the supply shock is already priced in. Demo text: the real version would present both camps with historical precedent.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["bitcoin"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 7, isFeatured: false, daysAgo: 13,
  },
  {
    title: "Tether Reports Quarterly Attestation With Reserve Breakdown",
    excerpt: "Demo article: the USDT issuer publishes its quarterly attestation detailing reserve composition.",
    lead: "Tether has published its latest quarterly attestation, offering a breakdown of the reserves backing USDT in this demo storyline. Real reporting would scrutinize the auditor's statement line by line.",
    categorySlug: "crypto", authorSlug: "danish-raza",
    tagSlugs: ["usdt", "stablecoins"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 5, isFeatured: false, daysAgo: 15,
  },
  {
    title: "Layer-2 Networks Hit Combined Transaction Record",
    excerpt: "Demo article: Ethereum layer-2 networks process a record number of combined transactions.",
    lead: "Ethereum's layer-2 ecosystem processed a record number of transactions this week, underscoring the shift of activity off the main chain. Demo text: production copy would compare the leading rollups.",
    categorySlug: "crypto", authorSlug: "bilal-ahmed",
    tagSlugs: ["ethereum", "blockchain"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 5, isFeatured: false, daysAgo: 17,
  },
  {
    title: "Crypto Market Cap Reclaims a Major Round-Number Milestone",
    excerpt: "Demo article: the aggregate crypto market capitalization pushes back above a key psychological level.",
    lead: "The total cryptocurrency market capitalization has pushed back above a closely watched round-number level, led by large-cap strength in this demo market snapshot. Real coverage would include breadth statistics.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["bitcoin", "ethereum", "solana"], sourceLabel: SourceLabel.NEWS_REPORT,
    readingMinutes: 4, isFeatured: false, daysAgo: 19,
  },

  /* ---------------- 5 Pakistan evergreen / educational ---------------- */
  {
    title: "How Pakistani Freelancers Use Stablecoins for Cross-Border Payments",
    excerpt: "Demo guide: an educational look at how freelancers use dollar-pegged stablecoins to receive international payments.",
    lead: "For Pakistan's large freelance workforce, getting paid across borders has traditionally meant slow transfers and steep fees. This educational demo guide walks through — in general terms — how dollar-pegged stablecoins are used worldwide as one option for receiving cross-border payments, and what to research before trying anything.",
    categorySlug: "pakistan", authorSlug: "danish-raza",
    tagSlugs: ["pakistan", "stablecoins", "usdt"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 8, isFeatured: true, daysAgo: 4,
  },
  {
    title: "A Beginner's Guide to Crypto Wallets for Users in Pakistan",
    excerpt: "Demo guide: hot wallets, cold wallets, and seed-phrase basics explained for first-time users.",
    lead: "Your crypto wallet is your gateway to Web3 — and your biggest security responsibility. This demo explainer covers the basic concepts every beginner should understand: custodial versus self-custody wallets, hot versus cold storage, and why your seed phrase must never be shared with anyone.",
    categorySlug: "pakistan", authorSlug: "bilal-ahmed",
    tagSlugs: ["pakistan", "blockchain"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 7, isFeatured: false, daysAgo: 7,
  },
  {
    title: "Understanding P2P Crypto Trading: A Primer for Pakistani Users",
    excerpt: "Demo guide: how peer-to-peer crypto marketplaces work, and the safety basics to know first.",
    lead: "Peer-to-peer marketplaces let buyers and sellers trade crypto directly, often using local payment methods. This demo primer explains the general mechanics — escrow, order books, and dispute resolution — plus the safety habits experienced traders recommend.",
    categorySlug: "pakistan", authorSlug: "danish-raza",
    tagSlugs: ["pakistan", "binance"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: false, daysAgo: 10,
  },
  {
    title: "How Digital Assets Fit Into a Pakistani Remittance Strategy",
    excerpt: "Demo guide: an educational overview of how remittance flows work and where digital assets are discussed globally.",
    lead: "Pakistan receives billions in remittances every year, and the cost of sending money home matters enormously to families. This demo article gives an educational overview of how remittance corridors work in general, and why digital assets are being discussed worldwide as a potential piece of the puzzle.",
    categorySlug: "pakistan", authorSlug: "danish-raza",
    tagSlugs: ["pakistan", "stablecoins", "usdt"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 7, isFeatured: false, daysAgo: 14,
  },
  {
    title: "Crypto Record-Keeping Basics Every Pakistani Trader Should Know",
    excerpt: "Demo guide: why keeping clean transaction records matters, and how to start a simple system.",
    lead: "Whether for personal accounting or future tax compliance, clean records are the foundation of responsible crypto participation. This demo guide explains — in general educational terms — what kinds of records traders typically keep, and why starting early beats reconstructing history later. It is not tax advice; consult a qualified professional.",
    categorySlug: "pakistan", authorSlug: "danish-raza",
    tagSlugs: ["pakistan", "crypto-regulation"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: false, daysAgo: 21,
  },

  /* ---------------- 5 blockchain ---------------- */
  {
    title: "What Is a Blockchain? A Plain-English Explainer",
    excerpt: "Demo explainer: blocks, chains, and distributed ledgers explained without the jargon.",
    lead: "Strip away the hype and a blockchain is a surprisingly simple idea: a shared record book that no single party controls. This demo explainer walks through blocks, hashes, and distributed consensus in plain language.",
    categorySlug: "blockchain", authorSlug: "bilal-ahmed",
    tagSlugs: ["blockchain", "web3"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: false, daysAgo: 12,
  },
  {
    title: "Proof of Work vs Proof of Stake: How Consensus Really Works",
    excerpt: "Demo explainer: the two dominant consensus mechanisms, compared side by side.",
    lead: "How do thousands of strangers agree on a single version of the truth? Through consensus mechanisms. This demo article compares proof of work and proof of stake — how they secure networks, what they cost, and why the distinction matters.",
    categorySlug: "blockchain", authorSlug: "bilal-ahmed",
    tagSlugs: ["blockchain", "bitcoin", "ethereum"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 8, isFeatured: false, daysAgo: 16,
  },
  {
    title: "Smart Contracts Explained: Code That Enforces Itself",
    excerpt: "Demo explainer: what smart contracts are, how they run, and what they make possible.",
    lead: "A smart contract is software that runs exactly as written, on a shared network, without intermediaries. This demo explainer covers how they work, where they live, and the kinds of applications they unlock — from lending to identity.",
    categorySlug: "blockchain", authorSlug: "bilal-ahmed",
    tagSlugs: ["blockchain", "ethereum"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: false, daysAgo: 20,
  },
  {
    title: "How Block Explorers Work and Why They Matter",
    excerpt: "Demo explainer: reading on-chain data with block explorers, the search engines of crypto.",
    lead: "Every transaction on a public blockchain is visible to anyone — if you know where to look. This demo guide introduces block explorers, shows what you can learn from a transaction page, and explains why transparency is a feature, not a bug.",
    categorySlug: "blockchain", authorSlug: "ayesha-khan",
    tagSlugs: ["blockchain", "bitcoin"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 5, isFeatured: false, daysAgo: 23,
  },
  {
    title: "The Rise of Modular Blockchains",
    excerpt: "Demo analysis: how the modular thesis is reshaping blockchain architecture.",
    lead: "Instead of one chain doing everything, the modular thesis splits blockchains into specialized layers for execution, settlement, and data availability. This demo analysis traces the idea and what it means for scalability.",
    categorySlug: "blockchain", authorSlug: "ayesha-khan",
    tagSlugs: ["blockchain", "ethereum", "solana"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 7, isFeatured: false, daysAgo: 25,
  },

  /* ---------------- 5 crypto deeper ---------------- */
  {
    title: "Dollar-Cost Averaging: A Disciplined Way to Buy Crypto",
    excerpt: "Demo guide: how regular fixed purchases smooth out crypto's notorious volatility.",
    lead: "Trying to time crypto markets is a losing game for most people. Dollar-cost averaging — buying a fixed amount on a regular schedule — is the classic disciplined alternative. This demo guide explains the mechanics and the psychology behind it. Not financial advice.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["bitcoin", "ethereum"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 5, isFeatured: false, daysAgo: 18,
  },
  {
    title: "Hot Wallets vs Cold Wallets: Choosing Your Custody Setup",
    excerpt: "Demo guide: the trade-offs between convenience and security in crypto custody.",
    lead: "Your custody setup is the single most important security decision in crypto. This demo guide compares hot wallets (connected, convenient) with cold wallets (offline, hardened) and helps you think through which fits your needs.",
    categorySlug: "crypto", authorSlug: "bilal-ahmed",
    tagSlugs: ["bitcoin", "ethereum", "blockchain"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: false, daysAgo: 22,
  },
  {
    title: "Understanding Crypto Volatility: Why Prices Swing So Hard",
    excerpt: "Demo analysis: liquidity, leverage, and sentiment — the forces behind crypto's wild moves.",
    lead: "Double-digit daily moves that would panic stock investors are routine in crypto. This demo analysis breaks down the structural reasons: thinner liquidity, heavy leverage, reflexive sentiment, and markets that never close.",
    categorySlug: "crypto", authorSlug: "ayesha-khan",
    tagSlugs: ["bitcoin", "ethereum", "solana"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 6, isFeatured: false, daysAgo: 24,
  },
  {
    title: "How to Read a Crypto Whitepaper Before You Invest",
    excerpt: "Demo guide: a checklist for evaluating crypto projects from their founding documents.",
    lead: "Before putting money into any crypto project, read its whitepaper — or at least know how to skim one critically. This demo guide gives you a practical checklist: tokenomics, team, roadmap realism, and red flags.",
    categorySlug: "crypto", authorSlug: "bilal-ahmed",
    tagSlugs: ["bitcoin", "ethereum", "blockchain"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 7, isFeatured: false, daysAgo: 26,
  },
  {
    title: "Stablecoins 101: USDT, USDC, and the Peg Mechanism",
    excerpt: "Demo explainer: how dollar-pegged stablecoins work and what keeps them at one dollar.",
    lead: "Stablecoins are the quiet workhorses of crypto — tokens designed to hold a steady value. This demo explainer covers fiat-backed models like USDT, how the peg is maintained, and the risks that have broken pegs in the past.",
    categorySlug: "crypto", authorSlug: "danish-raza",
    tagSlugs: ["stablecoins", "usdt"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: false, daysAgo: 27,
  },

  /* ---------------- 5 web3 ---------------- */
  {
    title: "What Is Web3? The Read-Write-Own Internet",
    excerpt: "Demo explainer: the vision of an internet where users own their data and digital assets.",
    lead: "Web1 was read-only, Web2 was read-write, and Web3 aims to add a third verb: own. This demo explainer traces the idea from first principles — tokens, wallets, and decentralized networks — without the buzzwords.",
    categorySlug: "web3", authorSlug: "bilal-ahmed",
    tagSlugs: ["web3", "blockchain"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 6, isFeatured: true, daysAgo: 28,
  },
  {
    title: "DAOs Explained: Organizations Run by Code",
    excerpt: "Demo explainer: how decentralized autonomous organizations coordinate without bosses.",
    lead: "A DAO is an organization whose rules are written in code and whose treasury is controlled by token-holder votes. This demo article explains how they form, how they govern, and where the model strains in practice.",
    categorySlug: "web3", authorSlug: "bilal-ahmed",
    tagSlugs: ["web3", "defi"], sourceLabel: SourceLabel.EDUCATIONAL,
    readingMinutes: 7, isFeatured: false, daysAgo: 29,
  },
  {
    title: "Digital Identity in Web3: Owning Your Online Self",
    excerpt: "Demo explainer: decentralized identity, soulbound tokens, and portable reputation.",
    lead: "In Web2, your identity lives on corporate servers. Web3 proposes the opposite: identity you carry yourself. This demo explainer covers decentralized identifiers, verifiable credentials, and the roadblocks ahead.",
    categorySlug: "web3", authorSlug: "ayesha-khan",
    tagSlugs: ["web3", "blockchain", "nft"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 6, isFeatured: false, daysAgo: 30,
  },
  {
    title: "The Creator Economy Meets Web3",
    excerpt: "Demo analysis: can tokens and NFTs give creators a better deal than platforms?",
    lead: "Creators have long depended on platforms that take a cut and control distribution. Web3 offers an alternative script: direct ownership of audiences and revenue. This demo analysis weighs the promise against the practical hurdles.",
    categorySlug: "web3", authorSlug: "bilal-ahmed",
    tagSlugs: ["web3", "nft"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 6, isFeatured: false, daysAgo: 31,
  },
  {
    title: "Gaming and Web3: Beyond Play-to-Earn Hype",
    excerpt: "Demo analysis: what blockchain actually adds to games — and what it doesn't.",
    lead: "The first wave of crypto gaming promised earnings; the second wave is asking a harder question: is the game fun? This demo analysis separates genuine on-chain innovation from speculative hype in Web3 gaming.",
    categorySlug: "web3", authorSlug: "ayesha-khan",
    tagSlugs: ["web3", "nft", "solana"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 6, isFeatured: false, daysAgo: 32,
  },

  /* ---------------- 3 ai-web3 ---------------- */
  {
    title: "How AI Agents Are Starting to Use Crypto Wallets",
    excerpt: "Demo explainer: autonomous software agents that hold keys, pay for services, and transact.",
    lead: "AI agents are beginning to do more than answer questions — some can now hold crypto wallets and pay for the services they use. This demo explainer covers how agent wallets work and the safety questions they raise.",
    categorySlug: "ai-web3", authorSlug: "ayesha-khan",
    tagSlugs: ["ai", "web3"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 7, isFeatured: false, daysAgo: 33,
  },
  {
    title: "Decentralized Compute: AI Training on Blockchain Rails",
    excerpt: "Demo analysis: marketplaces for GPU power and the idea of permissionless AI infrastructure.",
    lead: "Training AI takes enormous compute, concentrated in a few hands. Decentralized compute networks propose a marketplace alternative. This demo analysis explains the concept and the technical trade-offs involved.",
    categorySlug: "ai-web3", authorSlug: "bilal-ahmed",
    tagSlugs: ["ai", "blockchain", "web3"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 7, isFeatured: false, daysAgo: 34,
  },
  {
    title: "AI × Web3: Verifying Machine-Generated Content On-Chain",
    excerpt: "Demo analysis: using blockchains to prove where AI-generated content came from.",
    lead: "As AI-generated media floods the internet, proving provenance matters more than ever. This demo analysis looks at how blockchains and content credentials could combine to verify what you're seeing.",
    categorySlug: "ai-web3", authorSlug: "danish-raza",
    tagSlugs: ["ai", "blockchain", "nft"], sourceLabel: SourceLabel.ANALYSIS,
    readingMinutes: 6, isFeatured: false, daysAgo: 35,
  },
];

const ORGANIZATIONS: Array<{
  name: string;
  slug: string;
  orgType: "GOVERNMENT" | "REGULATOR" | "EXCHANGE";
  description: string;
  websiteUrl: string | null;
}> = [
  {
    name: "State Bank of Pakistan",
    slug: "sbp",
    orgType: "REGULATOR",
    description: "Pakistan's central bank; regulates banks and the country's monetary and payment systems.",
    websiteUrl: "https://www.sbp.org.pk",
  },
  {
    name: "Securities and Exchange Commission of Pakistan",
    slug: "secp",
    orgType: "REGULATOR",
    description: "Pakistan's corporate and capital-markets regulator.",
    websiteUrl: "https://www.secp.gov.pk",
  },
  {
    name: "Pakistan Virtual Assets Regulatory Authority",
    slug: "pvara",
    orgType: "REGULATOR",
    description: "Pakistan's dedicated regulator for virtual assets and virtual asset service providers.",
    websiteUrl: null,
  },
  {
    name: "Ministry of Finance",
    slug: "ministry-of-finance",
    orgType: "GOVERNMENT",
    description: "Federal ministry responsible for Pakistan's economic and fiscal policy.",
    websiteUrl: null,
  },
  {
    name: "Ministry of IT & Telecom",
    slug: "ministry-of-it-telecom",
    orgType: "GOVERNMENT",
    description: "Federal ministry responsible for information technology and telecommunications policy.",
    websiteUrl: null,
  },
  {
    name: "Federal Board of Revenue",
    slug: "federal-board-of-revenue",
    orgType: "GOVERNMENT",
    description: "Pakistan's federal tax administration body.",
    websiteUrl: null,
  },
  {
    name: "Binance",
    slug: "binance",
    orgType: "EXCHANGE",
    description: "Global cryptocurrency exchange platform (demo reference entry).",
    websiteUrl: "https://www.binance.com",
  },
];

interface RegulationSpec {
  title: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "PROPOSED";
  institution: string | null;
  impactArea: string | null;
  isDemo: boolean;
  events: Array<{
    date: string;
    title: string;
    description: string;
    status: "ANNOUNCED" | "IMPLEMENTED";
    sourceUrl: string | null;
    isDemo: boolean;
  }>;
  sources: Array<{
    orgName: string;
    organizationSlug: string | null;
    docTitle: string;
    url: string | null;
    sourceType: "OFFICIAL" | "NEWS";
  }>;
}

/**
 * Only verified facts from the platform spec are seeded as non-demo
 * regulations. Nothing else about Pakistani regulation is invented here.
 */
const REGULATIONS: RegulationSpec[] = [
  {
    title: "Virtual Assets Act, 2026",
    slug: "virtual-assets-act-2026",
    description:
      "Pakistan's primary legislation establishing a licensing and supervisory regime for virtual assets and virtual asset service providers.",
    status: "ACTIVE",
    institution: "Parliament of Pakistan",
    impactArea: "Licensing & market structure",
    isDemo: false,
    events: [
      {
        date: "2026-02-15",
        title: "Parliament passes the Virtual Assets Act",
        description: "Parliament passes the Virtual Assets Act, 2026.",
        status: "ANNOUNCED",
        sourceUrl: null,
        isDemo: false,
      },
      {
        date: "2026-03-05",
        title: "Act comes into force",
        description: "The Virtual Assets Act, 2026 comes into force on March 5, 2026.",
        status: "IMPLEMENTED",
        sourceUrl: null,
        isDemo: false,
      },
    ],
    sources: [
      {
        orgName: "Parliament of Pakistan",
        organizationSlug: null,
        docTitle: "Virtual Assets Act, 2026 — enacted legislation (see official gazette)",
        url: null,
        sourceType: "OFFICIAL",
      },
    ],
  },
  {
    title: "Pakistan Virtual Assets Regulatory Authority (PVARA)",
    slug: "pvara",
    description:
      "Pakistan's dedicated virtual-assets regulator, established by presidential ordinance and later placed on permanent statutory footing.",
    status: "ACTIVE",
    institution: "Federal Government of Pakistan",
    impactArea: "Regulatory authority",
    isDemo: false,
    events: [
      {
        date: "2025-07-08",
        title: "PVARA established by presidential ordinance",
        description: "The Pakistan Virtual Assets Regulatory Authority is established by presidential ordinance.",
        status: "IMPLEMENTED",
        sourceUrl: null,
        isDemo: false,
      },
      {
        date: "2026-03-05",
        title: "PVARA put on permanent statutory footing via Virtual Assets Act",
        description: "PVARA is placed on permanent statutory footing through the Virtual Assets Act, 2026.",
        status: "IMPLEMENTED",
        sourceUrl: null,
        isDemo: false,
      },
    ],
    sources: [
      {
        orgName: "PVARA",
        organizationSlug: "pvara",
        docTitle: "PVARA establishment and mandate — official announcements",
        url: null,
        sourceType: "OFFICIAL",
      },
    ],
  },
  {
    title: "PVARA Licensing Framework for VASPs",
    slug: "pvara-licensing-framework",
    description:
      "PVARA's licensing regime for virtual asset service providers, covering ten licence categories with a compliance window for existing providers.",
    status: "ACTIVE",
    institution: "PVARA",
    impactArea: "Licensing",
    isDemo: false,
    events: [
      {
        date: "2026-08-21",
        title: "Licensing regulations notified; licensing portal opened",
        description:
          "PVARA notifies licensing regulations and opens its licensing portal: ten licence categories, with a compliance window for existing providers.",
        status: "IMPLEMENTED",
        sourceUrl: null,
        isDemo: false,
      },
      {
        date: "2026-09-01",
        title: "70+ licence applications reported",
        description:
          "More than 70 licence applications reported in the press. Figure is as reported in press coverage, not independently verified here.",
        status: "ANNOUNCED",
        sourceUrl: null,
        isDemo: false,
      },
    ],
    sources: [
      {
        orgName: "PVARA",
        organizationSlug: "pvara",
        docTitle: "VASP licensing regulations and licensing portal — official notice",
        url: null,
        sourceType: "OFFICIAL",
      },
      {
        orgName: "PVARA",
        organizationSlug: "pvara",
        docTitle: "Press reporting: 70+ licence applications received (figure as reported in press)",
        url: null,
        sourceType: "NEWS",
      },
    ],
  },
  {
    title: "SBP Banking Framework for Virtual Asset Service Providers",
    slug: "sbp-vasp-banking-framework",
    description:
      "State Bank of Pakistan framework replacing the 2018 prohibition and permitting banks to serve PVARA-licensed virtual asset service providers.",
    status: "ACTIVE",
    institution: "State Bank of Pakistan",
    impactArea: "Banking access",
    isDemo: false,
    events: [
      {
        date: "2026-04-10",
        title: "SBP replaces 2018 prohibition; banks permitted to serve PVARA-licensed VASPs",
        description:
          "The State Bank of Pakistan replaces its 2018 prohibition; banks are permitted to provide services to PVARA-licensed virtual asset service providers.",
        status: "IMPLEMENTED",
        sourceUrl: null,
        isDemo: false,
      },
    ],
    sources: [
      {
        orgName: "State Bank of Pakistan",
        organizationSlug: "sbp",
        docTitle: "Banking framework for virtual asset service providers — official circular (see sbp.org.pk)",
        url: "https://www.sbp.org.pk",
        sourceType: "OFFICIAL",
      },
    ],
  },
  {
    title: "Digital Assets Taxation Framework (SAMPLE)",
    slug: "digital-assets-taxation-sample",
    description:
      "SAMPLE placeholder entry for layout and development purposes only. This is NOT a real regulation, proposal, or government announcement. Replace with verified content before production use.",
    status: "PROPOSED",
    institution: null,
    impactArea: "Taxation (sample)",
    isDemo: true,
    events: [
      {
        date: "2026-01-01",
        title: "Sample event (placeholder)",
        description: "Placeholder event for development. Not a real event.",
        status: "ANNOUNCED",
        sourceUrl: null,
        isDemo: true,
      },
    ],
    sources: [
      {
        orgName: "Web3 Pakistan (demo)",
        organizationSlug: null,
        docTitle: "SAMPLE placeholder source — not a real document",
        url: null,
        sourceType: "NEWS",
      },
    ],
  },
];

const MARKET_DATA: Array<{
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}> = [
  { symbol: "BTC", name: "Bitcoin", priceUsd: 97432.5, change24h: 2.4, marketCap: 1920000000000, volume24h: 48500000000, sparkline: [94100, 94800, 94200, 95500, 96100, 95800, 96900, 97432.5] },
  { symbol: "ETH", name: "Ethereum", priceUsd: 3412.8, change24h: 3.1, marketCap: 410000000000, volume24h: 22000000000, sparkline: [3280, 3305, 3290, 3340, 3375, 3360, 3398, 3412.8] },
  { symbol: "BNB", name: "BNB", priceUsd: 692.4, change24h: 1.2, marketCap: 102000000000, volume24h: 2100000000, sparkline: [678, 681, 679, 685, 688, 686, 690, 692.4] },
  { symbol: "SOL", name: "Solana", priceUsd: 214.75, change24h: 5.6, marketCap: 103000000000, volume24h: 6800000000, sparkline: [198, 201, 199, 205, 208, 206, 211, 214.75] },
  { symbol: "USDT", name: "Tether", priceUsd: 1.0, change24h: 0.01, marketCap: 138000000000, volume24h: 65000000000, sparkline: [1.0, 1.0, 0.999, 1.0, 1.001, 1.0, 1.0, 1.0] },
];

const SITE_SETTINGS: Array<{ key: string; value: string }> = [
  { key: "siteTitle", value: "Web3 Pakistan" },
  { key: "siteDescription", value: "Pakistan's Web3 & Crypto Intelligence Hub" },
  { key: "twitterUrl", value: "https://x.com/web3pakistan" },
  { key: "facebookUrl", value: "https://facebook.com/web3pakistan" },
  { key: "instagramUrl", value: "https://instagram.com/web3pakistan" },
  { key: "youtubeUrl", value: "https://youtube.com/@web3pakistan" },
  { key: "telegramUrl", value: "https://t.me/web3pakistan" },
];

const BREAKING_NEWS: Array<{ text: string; priority: number }> = [
  {
    text: "Demo ticker: this is a sample breaking-news item used for layout testing on Web3 Pakistan.",
    priority: 1,
  },
  {
    text: "Demo ticker: breaking-news items marked as demo will be replaced with real headlines before launch.",
    priority: 2,
  },
];

const AD_PLACEMENTS = ["homepage-banner", "article-top", "article-middle", "sidebar"];

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  console.log("Seeding Web3 Pakistan database...");

  // Categories
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: { name: c.name, slug: c.slug, description: c.description },
    });
  }
  console.log(`  categories: ${CATEGORIES.length}`);

  // Tags
  for (const name of TAGS) {
    await prisma.tag.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
  }
  console.log(`  tags: ${TAGS.length}`);

  // Authors
  for (const a of AUTHORS) {
    const slug = slugify(a.name);
    await prisma.author.upsert({
      where: { slug },
      update: { name: a.name, bio: a.bio },
      create: { name: a.name, slug, bio: a.bio },
    });
  }
  console.log(`  authors: ${AUTHORS.length}`);

  // Articles (all demo)
  let articleCount = 0;
  for (const spec of ARTICLES) {
    const slug = slugify(spec.title);
    const publishedAt = new Date(Date.now() - spec.daysAgo * 24 * 3600 * 1000);
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: spec.categorySlug } });
    const author = await prisma.author.findUniqueOrThrow({ where: { slug: spec.authorSlug } });

    const article = await prisma.article.upsert({
      where: { slug },
      update: {
        title: spec.title,
        excerpt: spec.excerpt,
        content: buildContent(spec.lead),
        categoryId: category.id,
        authorId: author.id,
        status: ArticleStatus.PUBLISHED,
        isFeatured: spec.isFeatured,
        sourceLabel: spec.sourceLabel,
        isDemo: true,
        publishedAt,
        readingMinutes: spec.readingMinutes,
      },
      create: {
        slug,
        title: spec.title,
        excerpt: spec.excerpt,
        content: buildContent(spec.lead),
        categoryId: category.id,
        authorId: author.id,
        status: ArticleStatus.PUBLISHED,
        isFeatured: spec.isFeatured,
        sourceLabel: spec.sourceLabel,
        isDemo: true,
        publishedAt,
        readingMinutes: spec.readingMinutes,
      },
    });

    for (const tagSlug of spec.tagSlugs) {
      const tag = await prisma.tag.findUniqueOrThrow({ where: { slug: tagSlug } });
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
        update: {},
        create: { articleId: article.id, tagId: tag.id },
      });
    }
    articleCount++;
  }
  console.log(`  articles: ${articleCount} (all isDemo=true, PUBLISHED)`);

  // Organizations
  for (const o of ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { slug: o.slug },
      update: { name: o.name, orgType: o.orgType, description: o.description, websiteUrl: o.websiteUrl },
      create: { name: o.name, slug: o.slug, orgType: o.orgType, description: o.description, websiteUrl: o.websiteUrl },
    });
  }
  console.log(`  organizations: ${ORGANIZATIONS.length}`);

  // Regulations + events + sources
  for (const r of REGULATIONS) {
    const regulation = await prisma.regulation.upsert({
      where: { slug: r.slug },
      update: {
        title: r.title,
        description: r.description,
        status: r.status,
        institution: r.institution,
        impactArea: r.impactArea,
        isDemo: r.isDemo,
      },
      create: {
        title: r.title,
        slug: r.slug,
        description: r.description,
        status: r.status,
        institution: r.institution,
        impactArea: r.impactArea,
        isDemo: r.isDemo,
      },
    });

    for (const e of r.events) {
      const existing = await prisma.regulatoryEvent.findFirst({
        where: { regulationId: regulation.id, title: e.title },
      });
      if (!existing) {
        await prisma.regulatoryEvent.create({
          data: {
            regulationId: regulation.id,
            date: new Date(e.date),
            title: e.title,
            description: e.description,
            status: e.status,
            sourceUrl: e.sourceUrl,
            isDemo: e.isDemo,
          },
        });
      }
    }

    for (const s of r.sources) {
      const existing = await prisma.source.findFirst({
        where: { regulationId: regulation.id, docTitle: s.docTitle },
      });
      if (!existing) {
        const organization = s.organizationSlug
          ? await prisma.organization.findUnique({ where: { slug: s.organizationSlug } })
          : null;
        await prisma.source.create({
          data: {
            regulationId: regulation.id,
            organizationId: organization ? organization.id : null,
            orgName: s.orgName,
            docTitle: s.docTitle,
            url: s.url,
            sourceType: s.sourceType,
          },
        });
      }
    }
  }
  console.log(`  regulations: ${REGULATIONS.length} (4 real, 1 demo sample)`);

  // Market data (mock)
  for (const m of MARKET_DATA) {
    await prisma.marketData.upsert({
      where: { symbol: m.symbol },
      update: {
        name: m.name,
        priceUsd: m.priceUsd,
        change24h: m.change24h,
        marketCap: m.marketCap,
        volume24h: m.volume24h,
        sparkline: m.sparkline,
      },
      create: {
        symbol: m.symbol,
        name: m.name,
        priceUsd: m.priceUsd,
        change24h: m.change24h,
        marketCap: m.marketCap,
        volume24h: m.volume24h,
        sparkline: m.sparkline,
      },
    });
  }
  console.log(`  market data: ${MARKET_DATA.length} rows`);

  // Site settings
  for (const s of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log(`  site settings: ${SITE_SETTINGS.length}`);

  // Breaking news (demo)
  for (const b of BREAKING_NEWS) {
    const existing = await prisma.breakingNews.findFirst({ where: { text: b.text } });
    if (!existing) {
      await prisma.breakingNews.create({
        data: { text: b.text, priority: b.priority, isActive: true },
      });
    }
  }
  console.log(`  breaking news: ${BREAKING_NEWS.length} demo items`);

  // Ad placements (all inactive)
  for (const slot of AD_PLACEMENTS) {
    await prisma.adPlacement.upsert({
      where: { slot },
      update: { isActive: false },
      create: { slot, isActive: false },
    });
  }
  console.log(`  ad placements: ${AD_PLACEMENTS.length} (inactive)`);

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@web3pakistan.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", name: "Site Admin" },
    create: {
      email: adminEmail,
      name: "Site Admin",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`  admin user: ${adminEmail} (ADMIN)`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
