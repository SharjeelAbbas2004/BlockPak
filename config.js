/* ============================================================
   BlockPak — Central Configuration
   Change the brand name, affiliate links, and API keys HERE ONLY.
   Every page reads from this file. No need to edit HTML.
   ============================================================ */

const BLOCKPAK_CONFIG = {
  // ---- Brand (change in one place) ----
  BRAND_NAME: "BlockPak",
  TAGLINE_EN: "Pakistan's Crypto Voice",
  TAGLINE_UR: "Pakistan ki crypto awaz",
  SITE_URL: "https://blockpak.com",   // replace with real domain at launch
  CONTACT_EMAIL: "hello@blockpak.com", // replace with real inbox

  // ---- Affiliate links (REPLACE the placeholder URLs with your real
  // ---- referral links before launch. Format: full URL with your code.
  // ---- Links render with rel="sponsored nofollow" automatically. ----
  AFFILIATE_LINKS: {
    binance: "https://www.binance.com/activity/referral-entry/CPA?ref=REPLACE_WITH_YOUR_CODE",
    bybit:   "https://www.bybit.com/invite?ref=REPLACE_WITH_YOUR_CODE",
    okx:     "https://www.okx.com/join/REPLACE_WITH_YOUR_CODE"
  },

  // ---- APIs & analytics (paste keys at launch) ----
  GA4_MEASUREMENT_ID: "",        // e.g. "G-XXXXXXXXXX"
  SEARCH_CONSOLE_VERIFICATION: "", // meta tag content from Google Search Console
  MAILCHIMP_FORM_ACTION: "",    // Mailchimp embedded form action URL
  COINGECKO_API: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=pkr",

  // ---- Compliance: only promote exchanges with PVARA licence/NOC ----
  COMPLIANCE_NOTE: "BlockPak only recommends exchanges holding a PVARA licence or No-Objection Certificate."
};
