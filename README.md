# Web3 Pakistan

A Next.js 14 news platform for Web3, crypto, and blockchain in Pakistan —
news articles, a regulation tracker (SBP/SECP policy timeline), market data
ticker, breaking-news ticker, comments, bookmarks, newsletters, and a full
admin CMS.

> **Naming note:** the GitHub repository is historically named **"BlockPak"**,
> but the product brand is **"Web3 Pakistan"**. All UI copy, titles, metadata,
> and emails use "Web3 Pakistan". Do **not** push to GitHub — publishing is
> handled separately by the project owner.

## Tech stack

- **Next.js 14** (App Router) + React 18 + TypeScript (strict)
- **PostgreSQL** via **Prisma ORM** (`prisma/schema.prisma`)
- **NextAuth v4** (credentials provider, JWT sessions, `USER`/`ADMIN` roles)
- **Tailwind CSS** + lucide-react icons, next-themes (dark mode)
- Validation: **zod** (`lib/validations.ts`); HTML sanitization: **sanitize-html**

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Required variables (see `.env.example` for the full template):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT/session secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Canonical app URL, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (sitemap, robots, canonicals, share links) |
| `ADMIN_EMAIL` | Email for the seeded admin account |
| `ADMIN_PASSWORD` | Password for the seeded admin account |
| `AI_API_KEY` | Optional — future AI-assistant backend (see "Ask" below) |

### 3. Database

```bash
npx prisma migrate deploy   # apply migrations (production-safe)
npx tsx prisma/seed.ts      # seed admin user, demo content, ad placements
```

### 4. Run

```bash
npm run dev                 # http://localhost:3000
npm run build && npm start   # production
```

**Admin login:** sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`,
then open `/admin`. Change the admin password immediately after first login
(there is no forced-rotation flow yet — do it via the profile/settings page).

## Project structure

```
app/                        # App Router pages + API routes
  (public pages)            # /, /news, /regulation, /crypto, /defi, /web3,
                            # /blockchain, /pakistan, /guides, /ai-web3, /ask,
                            # /daily-brief, /tag/[slug], /search, /newsletter,
                            # /advertise, /about, /contact, /login, /register,
                            # /profile, /bookmarks, /history, /settings,
                            # editorial/policy pages (privacy, terms, disclaimer…)
  admin/                    # /admin dashboard (ADMIN role only, middleware-guarded)
  api/
    auth/[...nextauth]/     # NextAuth credentials provider
    auth/register           # user sign-up (existing)
    auth/forgot-password    # password reset flow (existing)
    auth/reset-password
    articles                # GET list (filters: category, tag, page, limit, featured, status)
    articles/[slug]         # GET full article + related
    articles/[slug]/comments# public comment endpoints
    articles/[slug]/view    # view counting
    tags, tags/[slug]       # GET tag index / tag + articles
    regulations, regulations/[slug]  # regulation tracker + timeline
    market/ticker           # GET coin ticker (MarketData → mock fallback)
    breaking-news           # GET active ticker items
    newsletter              # POST subscribe (existing)
    contact                 # POST contact form (existing)
    search                  # site search (existing)
    comments…               # like / report
    bookmarks               # POST toggle bookmark (existing)
    daily-brief             # daily brief endpoints
    trending                # trending articles
    ask                     # POST AI assistant (503 honest stub)
    ingestion/status        # ingestion pipeline status (scaffolded)
    user/…                  # profile, preferences, bookmarks, reading history
    admin/                  # ADMIN-only CRUD (see below)
lib/
  auth.ts                   # NextAuth options (credentials provider)
  admin.ts                  # requireAdmin() — 403 unless ADMIN session
  http.ts                   # readJson() / validationError() helpers
  prisma.ts                 # PrismaClient singleton
  validations.ts            # zod schemas (public + admin)
  rate-limit.ts             # in-memory token-bucket limiter
  sanitize.ts               # sanitizeHtml() allowlist
  articles.ts               # server-side article fetch helpers
  categories.ts / dailyBrief.ts / preferences.ts / utils.ts
  services/
    market.ts               # MOCK market data (clearly marked)
    newsletter.ts           # local newsletter subscription store
    email.ts                # email service (not configured)
    ingestion.ts            # RSS ingestion pipeline architecture stub
components/                 # cards/ charts/ tickers/ comments/ admin/ layout/ ui/ …
prisma/
  schema.prisma             # full data model (see below)
  seed.ts                   # admin user + demo content
middleware.ts               # /admin/* requires ADMIN role
```

### Data model (Prisma)

`User` (roles USER/ADMIN), `Author`, `Category`, `Tag`, `Article` (+`ArticleTag`,
`Source`, `Comment`, `Bookmark`, `ReadingHistory`, `ArticleView`),
`Regulation` + `RegulatoryEvent`, `Organization`, `Source`, `MarketData`,
`NewsletterSubscriber`, `Media`, `SiteSetting`, `BreakingNews`, `AdPlacement`.

## API reference

All routes return JSON. Public list routes use `export const dynamic =
'force-dynamic'` and return `500 { error }` on unexpected failures.

### Public

| Method | Route | Notes |
|---|---|---|
| GET | `/api/articles?category=&tag=&page=1&limit=12&featured=true&status=published` | Only PUBLISHED unless caller is ADMIN (then `status` may be `draft`/`scheduled`/`published`/`all`). Returns `{ articles, totalPages, total }` |
| GET | `/api/articles/[slug]` | Full article + `related`. 404 unless PUBLISHED |
| GET | `/api/tags` | `{ tags: [{ name, slug, _count }] }` (published counts) |
| GET | `/api/tags/[slug]` | `{ tag, articles }` |
| GET | `/api/regulations` | `{ regulations: [{ slug, title, status, institution, updatedAt }] }` |
| GET | `/api/regulations/[slug]` | `{ regulation: { …, events[] (chronological), sources[] } }` |
| GET | `/api/market/ticker` | `{ coins: [{ symbol, name, price, change24h, sparkline }] }` — from `MarketData`, falls back to mock |
| POST | `/api/ask` | **Always 503** `{ error: 'AI assistant is not configured yet.' }` until the LLM wiring lands (see `lib/services` notes). Rate-limited 60/min |
| GET | `/api/ingestion/status` | `{ enabled: false, stages, message }` — scaffold only |

### Admin (`/api/admin/*` — requires ADMIN session, else 403)

| Method | Route | Notes |
|---|---|---|
| GET | `/api/admin/stats` | `{ totalArticles, published, drafts, totalViews, subscribers, todayArticles }` |
| GET/POST | `/api/admin/articles` | List (`?status=&page=`, 20/page); create validates with `articleSchema` + admin fields, **content sanitized on write** |
| PUT/DELETE | `/api/admin/articles/[id]` | Update (partial; nested tags replaced; `publishedAt` stamped on publish); delete |
| GET/POST | `/api/admin/categories` | Create/update/delete |
| PUT/DELETE | `/api/admin/categories/[id]` | Delete blocked (400) while articles use it |
| GET/POST | `/api/admin/regulations` | Create with nested `events[]` |
| PUT/DELETE | `/api/admin/regulations/[id]` | Update; **nested events are fully replaced** |
| GET/POST | `/api/admin/breaking` | Breaking-news ticker items |
| PUT/DELETE | `/api/admin/breaking/[id]` | |
| GET/POST | `/api/admin/authors` | |
| PUT/DELETE | `/api/admin/authors/[id]` | Delete blocked (400) while articles use the author |
| GET/POST | `/api/admin/media` | `{ items }`; create `{ url, alt? }` |
| DELETE | `/api/admin/media/[id]` | |
| GET | `/api/admin/subscribers` | `{ items }` |
| DELETE | `/api/admin/subscribers/[id]` | |
| GET | `/api/admin/comments?status=` | `{ items: [{ id, content, status, createdAt, article:{title,slug}, user:{name,email} }] }` |
| PUT/DELETE | `/api/admin/comments/[id]` | `PUT { status: PENDING\|APPROVED\|REJECTED }` |
| GET/PUT | `/api/admin/settings` | `{ settings: [{ key, value }] }`; PUT `{ key, value }` upserts |
| GET | `/api/admin/ads` | `{ placements }` |
| PUT | `/api/admin/ads/[id]` | `{ isActive }` toggle |

### Shared helpers

- `lib/admin.ts → requireAdmin()` — `getServerSession(authOptions)` check;
  returns `403 { error: 'Forbidden.' }` for non-admins.
- `lib/http.ts → readJson() / validationError()` — safe body parsing and
  zod error responses.
- `lib/rate-limit.ts → rateLimit(key, limit, windowMs)` — in-memory token
  bucket; `clientKey(req, scope)` builds per-IP keys.
- `lib/sanitize.ts → sanitizeHtml(dirty)` — allowlist (`p,h2,h3,strong,em,
  a[href],img[src,alt],blockquote,ul,ol,li,table,tr,td,th,pre,code,div[class],
  span,br,hr`). **Always applied on admin article create/update.**

## MOCK vs REAL

| Feature | Status |
|---|---|
| Market ticker data | **MOCK** — `lib/services/market.ts` hardcoded coins until `MarketData` is wired to CoinGecko/CoinMarketCap. Never present mock prices as live |
| "Ask Web3 Pakistan" AI | **STUB** — `POST /api/ask` always 503. `AI_API_KEY` reserved; architecture documented in the route comments |
| Ingestion pipeline | **SCAFFOLD** — `lib/services/ingestion.ts` has typed stubs only; `GET /api/ingestion/status` reports disabled |
| Contact form | **Not configured** — no mail provider wired (`lib/services/email.ts` placeholder) |
| Newsletter | **Local storage** — subscribers saved to DB; no Mailchimp/ESP sync |
| Ad placements | **Inactive** — `AdPlacement` rows exist, all `isActive: false` |
| Everything else | **REAL** — auth, articles, comments, bookmarks, regulation tracker, admin CMS run on PostgreSQL |

**Editorial rule:** never invent government announcements. The regulation
tracker and ingestion pipeline only publish human-authored or source-cited
content; ingested items must stay DRAFT until an admin approves them.

## Rate limiting

- `lib/rate-limit.ts` is an in-memory token bucket (no Redis needed).
- Currently applied at **60 requests/minute per IP** on `POST /api/ask`.
- Not yet applied to the pre-existing `newsletter`, `contact`, `register`,
  and `comments` routes — they should adopt it: wrap the handler with
  `rateLimit(clientKey(req, '<scope>'), 60, 60_000)` and return `429` when
  it returns `false` (see `/api/ask` for the pattern).
- On multi-instance/serverless deploys each instance keeps its own buckets;
  move to a shared store (Upstash/Redis) if you need exact global limits.

## Launch checklist

- [ ] **Domain & hosting** — point DNS, set `NEXTAUTH_URL` and
      `NEXT_PUBLIC_SITE_URL` to the production domain
- [ ] **Environment** — set all production env vars (fresh `NEXTAUTH_SECRET`)
- [ ] **Database** — `npx prisma migrate deploy` against production Postgres
- [ ] **Seed** — `npx tsx prisma/seed.ts` (creates admin + baseline content)
- [ ] **Admin password** — change `ADMIN_PASSWORD` and re-seed/rotate the
      admin account immediately after first login
- [ ] **Market data** — wire `MarketData` to CoinGecko/CoinMarketCap and
      remove reliance on the mock fallback
- [ ] **AI assistant** — implement `POST /api/ask` (set `AI_API_KEY`) or
      remove the `/ask` page
- [ ] **Email** — configure the mail provider for contact form, password
      reset, and newsletter sending (or connect Mailchimp)
- [ ] **Ads** — add real ad code to `AdPlacement` rows and toggle `isActive`
- [ ] **Affiliate links** — add/replace affiliate URLs in ad and content slots
- [ ] **Analytics** — add GA4 (or privacy-friendly alternative) snippet
- [ ] **Search Console** — verify domain, submit sitemap (`/sitemap.xml`)
- [ ] **Socials** — create/link X, Facebook, Instagram, YouTube, TikTok;
      update share/footer links
- [ ] **Rate limits** — apply `lib/rate-limit.ts` to newsletter/contact/
      register/comments routes (see above)
- [ ] **Backups** — schedule Postgres backups before going live
