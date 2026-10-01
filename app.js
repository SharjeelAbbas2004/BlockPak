/* ============================================================
   BlockPak — app.js
   Theme toggle, mobile menu, price ticker, reading progress,
   share buttons, affiliate link injection, search, form demos.
   ============================================================ */
(function () {
  "use strict";
  const cfg = window.BLOCKPAK_CONFIG || {};

  /* ---------- Theme (dark default, persist in localStorage) ---------- */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("blockpak-theme");
  if (savedTheme === "light") root.setAttribute("data-theme", "light");
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const sync = () => {
      btn.textContent = root.getAttribute("data-theme") === "light" ? "🌙" : "☀️";
      btn.setAttribute("aria-label", root.getAttribute("data-theme") === "light" ? "Switch to dark mode" : "Switch to light mode");
    };
    sync();
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      if (next === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      localStorage.setItem("blockpak-theme", next);
      sync();
    });
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.querySelector("[data-menu-btn]");
  const nav = document.querySelector("[data-main-nav]");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Brand name injection (single source: config.js) ---------- */
  document.querySelectorAll("[data-brand]").forEach((el) => {
    el.textContent = cfg.BRAND_NAME || "BlockPak";
  });
  document.title = document.title.replace(/BlockPak/g, cfg.BRAND_NAME || "BlockPak");

  /* ---------- Affiliate links: <a data-aff="binance"> ---------- */
  const aff = cfg.AFFILIATE_LINKS || {};
  document.querySelectorAll("a[data-aff]").forEach((a) => {
    const key = a.getAttribute("data-aff");
    if (aff[key]) {
      a.href = aff[key];
      a.setAttribute("rel", "sponsored nofollow noopener");
      a.setAttribute("target", "_blank");
    } else {
      a.href = "#";
      a.addEventListener("click", (e) => e.preventDefault());
      a.title = "Affiliate link not configured yet — see config.js";
    }
  });

  /* ---------- Sponsored badge: <article data-sponsored="true"> ---------- */
  document.querySelectorAll("[data-sponsored='true']").forEach((el) => {
    if (!el.querySelector(".sponsored-badge")) {
      const badge = document.createElement("span");
      badge.className = "sponsored-badge";
      badge.textContent = "Sponsored";
      const h1 = el.querySelector("h1");
      if (h1) h1.insertAdjacentElement("beforebegin", badge);
      else el.insertAdjacentElement("afterbegin", badge);
    }
  });

  /* ---------- Live price ticker (CoinGecko, graceful fallback) ---------- */
  const tickerEls = document.querySelectorAll("[data-price-ticker]");
  if (tickerEls.length && cfg.COINGECKO_API) {
    const fmt = (n) => "Rs " + Math.round(n).toLocaleString("en-PK");
    fetch(cfg.COINGECKO_API)
      .then((r) => { if (!r.ok) throw new Error("ticker failed"); return r.json(); })
      .then((d) => {
        const items = [
          ["BTC", d.bitcoin && d.bitcoin.pkr],
          ["ETH", d.ethereum && d.ethereum.pkr],
          ["USDT", d.tether && d.tether.pkr]
        ];
        tickerEls.forEach((el) => {
          el.innerHTML = items
            .map(([sym, px]) => `<span class="tick"><b>${sym}</b> ${px ? fmt(px) : "—"}</span>`)
            .join('<span class="tick-sep">•</span>');
          el.classList.add("tick-live");
        });
      })
      .catch(() => {
        tickerEls.forEach((el) => {
          el.innerHTML = '<span class="tick">BTC —</span><span class="tick-sep">•</span><span class="tick">ETH —</span><span class="tick-sep">•</span><span class="tick">USDT —</span>';
          el.title = "Live prices unavailable right now — please check back shortly.";
        });
      });
  }

  /* ---------- Reading progress bar ---------- */
  const progress = document.querySelector("[data-progress]");
  if (progress) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Share buttons ---------- */
  document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const network = btn.getAttribute("data-share");
      const url = encodeURIComponent(location.href);
      const text = encodeURIComponent(document.title);
      const links = {
        x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        telegram: `https://t.me/share/url?url=${url}&text=${text}`,
        whatsapp: `https://wa.me/?text=${text}%20${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
      };
      if (links[network]) window.open(links[network], "_blank", "width=600,height=540");
    });
  });

  /* ---------- Site search (client-side index) ---------- */
  const SEARCH_INDEX = [
    { t: "Pakistan Opens Crypto Licensing Portal: What It Means for You", u: "news/pvara-licensing-portal-live.html", d: "PVARA licensing regulations are live — exchanges must get licensed.", lang: "EN" },
    { t: "Virtual Assets Act 2026: Pakistan's Crypto Law, Explained Simply", u: "news/virtual-assets-act-explained.html", d: "The complete plain-English breakdown of Pakistan's new crypto law.", lang: "EN" },
    { t: "Binance Receives PVARA No-Objection Certificate", u: "news/binance-pvara-noc.html", d: "What Binance's NOC means for Pakistani users.", lang: "EN" },
    { t: "Crypto Tax in Pakistan: The Complete 2026 Guide", u: "learn/crypto-tax-pakistan-guide.html", d: "FBR, capital gains, record-keeping — everything you must know.", lang: "EN" },
    { t: "Binance par PKR se Crypto Kaise Khareedein", u: "learn/binance-pkr-buy-guide-roman-urdu.html", d: "Step-by-step Roman Urdu guide to buying crypto with PKR.", lang: "UR" },
    { t: "Best Crypto Exchanges in Pakistan (2026)", u: "rankings.html", d: "Ranked and compared — only PVARA-compliant platforms.", lang: "EN" },
    { t: "Press Releases", u: "press-releases.html", d: "Sponsored announcements from crypto projects.", lang: "EN" }
  ];
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  if (searchInput && searchResults) {
    // Pages in subdirectories need "../" prefix for root-relative result URLs
    const inSubdir = /^\/(news|learn|press)\//.test(location.pathname) ||
      /(^|\/)news\/|learn\/|press\//.test(location.pathname);
    const urlPrefix = /(^|\/)(news|learn|press)\/[^/]*\.html$/.test(location.pathname) ? "../" : "";
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) { searchResults.innerHTML = ""; searchResults.hidden = true; return; }
      const hits = SEARCH_INDEX.filter((i) => (i.t + " " + i.d).toLowerCase().includes(q)).slice(0, 6);
      searchResults.innerHTML = hits.length
        ? hits.map((h) => `<a href="${urlPrefix}${h.u}"><span class="sr-lang">${h.lang}</span><span><b>${h.t}</b><small>${h.d}</small></span></a>`).join("")
        : `<div class="sr-empty">No results for "${searchInput.value.trim()}"</div>`;
      searchResults.hidden = false;
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-search-wrap]")) searchResults.hidden = true;
    });
  }

  /* ---------- Newsletter + contact forms (demo handlers) ---------- */
  document.querySelectorAll("form[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector("input[type=email]");
      const msg = form.querySelector("[data-form-msg]") || document.createElement("p");
      if (email && email.value.includes("@")) {
        // TODO: connect cfg.MAILCHIMP_FORM_ACTION at launch
        msg.textContent = "You're on the list! Please check your inbox to confirm. (Demo mode — connect your email service in config.js at launch.)";
        msg.className = "form-msg success";
        form.reset();
      } else {
        msg.textContent = "Please enter a valid email address.";
        msg.className = "form-msg error";
      }
      if (!form.querySelector("[data-form-msg]")) { msg.setAttribute("data-form-msg", ""); form.appendChild(msg); }
    });
  });
  const contactForm = document.querySelector("form[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = contactForm.querySelector("[data-form-msg]");
      msg.textContent = "Message received! We reply within 2 business days. (Demo mode — connect a form backend like Formspree at launch.)";
      msg.className = "form-msg success";
      contactForm.reset();
    });
  }
  const prForm = document.querySelector("form[data-pr-form]");
  if (prForm) {
    prForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = prForm.querySelector("[data-form-msg]");
      msg.textContent = "Submission received! Our team will review it and send payment instructions within 24 hours. (Demo mode — connect payments + email at launch.)";
      msg.className = "form-msg success";
      prForm.reset();
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
});
