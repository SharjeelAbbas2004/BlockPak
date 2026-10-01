# BlockPak — Pakistan's Crypto Voice

A complete static news/media website. No build step, no database, no framework —
open `index.html` in any browser and it works. Upload the folder to any static host
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, or cPanel shared hosting) and it's live.

## How to run locally

**Option A — just open it:** double-click `index.html`. Everything works except the
live price ticker (browsers block `fetch()` on `file://` URLs).

**Option B — local server (recommended, enables the price ticker):**
```bash
cd ~/workspace/blockpak
python3 -m http.server 8000
# then open http://localhost:8000
```

## How to add a new article

1. Copy an existing article as your template:
   - News: copy `news/pvara-licensing-portal-live.html` → `news/your-slug.html`
   - Guide: copy `learn/crypto-tax-pakistan-guide.html` → `learn/your-slug.html`
2. Edit the copy: change the `<title>`, meta description, headline, body and date.
3. If it's a guide with FAQs, update the FAQ HTML **and** the FAQ JSON-LD block.
4. Add a card for it on `news.html` or `learn.html` (copy any `.card` block).
5. Add one line to `sitemap.xml` and one entry to the `SEARCH_INDEX` array in `app.js`.
6. Sponsored post? Add `data-sponsored="true"` to the `<article>` tag — the badge appears automatically.

## How to change the brand name

Edit **one file**: `config.js` → `BRAND_NAME`. The header logo, footer and
copyright update automatically on every page. (The `<title>` tags contain the old
name as static text — do a find/replace of "BlockPak" across `*.html` if you rename.)

## Where API keys go (all in `config.js`)

| Key | Where to get it |
|---|---|
| `GA4_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams |
| `SEARCH_CONSOLE_VERIFICATION` | Google Search Console → Settings → Verification |
| `MAILCHIMP_FORM_ACTION` | Mailchimp → Audience → Signup forms → Embedded form |
| `AFFILIATE_LINKS` | Your Binance / Bybit / OKX referral dashboards |
| `COINGECKO_API` | Works without a key (free tier, rate-limited) |

The contact, newsletter and press-release forms currently show a demo confirmation.
At launch, point them at a real backend (Formspree, Getform, or your Mailchimp action URL).

## Launch checklist

- [ ] Buy domain (e.g. blockpak.com) — Namecheap / Cloudflare Registrar
- [ ] Point domain to your host (Netlify / Vercel / Cloudflare Pages recommended — free)
- [ ] Replace `https://blockpak.com` in `sitemap.xml`, `robots.txt` and JSON-LD with your real domain
- [ ] Paste real affiliate links into `config.js` (only PVARA-licensed / NOC exchanges)
- [ ] Add GA4 + Search Console, submit `sitemap.xml`
- [ ] Connect newsletter forms to Mailchimp / ConvertKit
- [ ] Create X + Telegram accounts with matching handle, link them in the footer
- [ ] Publish 5 launch articles, then follow the 90-day content plan

## File map

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, news grid, guides, tickers, newsletter band |
| `news.html` / `news/*.html` | News listing + 3 full articles |
| `learn.html` / `learn/*.html` | Guides hub + tax guide (EN) + Binance P2P guide (Roman Urdu) |
| `rankings.html` | Exchange comparison table with affiliate disclosure |
| `press-releases.html` / `press/*.html` | Sponsored releases + sample format demo |
| `submit-press-release.html` | Paid submission form |
| `about/contact/disclaimer/privacy-policy/newsletter.html` | Standard pages |
| `styles.css` | All styling, dark/light themes |
| `app.js` | Interactivity (theme, ticker, search, share, forms) |
| `config.js` | Brand name, affiliate links, API keys — edit this, not HTML |
| `sitemap.xml` / `robots.txt` | SEO infrastructure |
