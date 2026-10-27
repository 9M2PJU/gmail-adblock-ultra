/* Gmail AdBlock — Ultra Fast content script
 * Runs at document_start. CSS-first hiding + rAF-batched MutationObserver.
 * Only hides nodes positively identified as ads. Never deletes emails.
 */
(() => {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    blockPromoted: true,   // sponsored rows in list
    blockTopShelf: true,   // top-picks / sponsored carousel
    blockSidebarAds: true, // side-rail promos
    privacy: true,         // hide 1px trackers
    hideChatMeet: false,
    compact: false,
    hideGemini: false,
    hideStorage: false,
    theme: 'default'       // default | clean-light | soft-dark | midnight | ocean | forest | rose | lavender
  };

  // Localized "Sponsored" / "Ad" badge texts seen in Gmail list rows.
  const SPONSORED_RE = /^(sponsored|ad|annonce|sponsorisé|gesponsert|anzeige|patrocinado|anuncio|sponsorizzato|sponsorlu|gesponsord|sponzorováno|szponzorált|χορηγούμενη|спонсор|реклама|赞助|廣告|スポンサー|광고|sponsrad|gesponsord)$/i;
  const THEMES = new Set(['default', 'clean-light', 'soft-dark', 'midnight', 'ocean', 'forest', 'rose', 'lavender']);

  const SELECTOR_ROW = 'tr.zA, tr.zA.yO, tr.zA.zE, div.zA';
  const MAX_DEPTH = 9;
  const seen = new WeakSet();
  let settings = { ...DEFAULTS };
  let queued = [];
  let scheduled = false;
  let sessionBlocked = 0;
  let lastUrl = location.href;

  /* ---------- settings ---------- */

  function applySettings(s) {
    settings = { ...DEFAULTS, ...s };
    const theme = typeof settings.theme === 'string' ? settings.theme : 'default';
    // Set flags on BOTH <html> and <body>: CSS reads body[data-gmx-*], and
    // setting both covers document_start (pre-body) plus instant popup toggles.
    const setAttrs = (t) => {
      t.dataset.gmxEnabled = settings.enabled ? '1' : '0';
      t.dataset.gmxPromoted = settings.blockPromoted ? '1' : '0';
      t.dataset.gmxTopshelf = settings.blockTopShelf ? '1' : '0';
      t.dataset.gmxSidebarads = settings.blockSidebarAds ? '1' : '0';
      t.dataset.gmxPrivacy = settings.privacy ? '1' : '0';
      t.dataset.gmxNochatmeet = settings.hideChatMeet ? '1' : '0';
      t.dataset.gmxCompact = settings.compact ? '1' : '0';
      t.dataset.gmxNogemini = settings.hideGemini ? '1' : '0';
      t.dataset.gmxNostorage = settings.hideStorage ? '1' : '0';
      // Theme applies independently of the ad-block master switch.
      t.dataset.gmxTheme = THEMES.has(theme) ? theme : 'default';
    };
    if (document.documentElement) setAttrs(document.documentElement);
    if (document.body) setAttrs(document.body);
  }

  function loadSettings() {
    try {
      chrome.storage.sync.get(DEFAULTS, (s) => {
        if (chrome.runtime.lastError) return applySettings(DEFAULTS);
        applySettings(s || DEFAULTS);
        // Re-scan after settings arrive (body may already have ads).
        requestSweep();
      });
    } catch {
      applySettings(DEFAULTS);
    }
  }

  /* ---------- counters ---------- */

  let flushTimer = 0;
  function bump(n) {
    if (!n) return;
    sessionBlocked += n;
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      try {
        chrome.storage.local.get({ blockedTotal: 0 }, (r) => {
          const total = (r.blockedTotal || 0) + sessionBlocked;
          sessionBlocked = 0;
          chrome.storage.local.set({ blockedTotal: total });
        });
      } catch { /* ignore */ }
    }, 1500);
  }

  /* ---------- detection ---------- */

  function isSponsoredLabel(el) {
    if (!(el instanceof Element)) return false;
    const t = (el.textContent || '').trim();
    if (!t || t.length > 24) return false;
    if (!SPONSORED_RE.test(t)) return false;
    // Must be a small badge-like node, not an email subject/body.
    // Badges are SPAN/DIV without block-level children.
    const tag = el.tagName;
    if (tag !== 'SPAN' && tag !== 'DIV' && tag !== 'FONT') return false;
    if (el.children.length > 2) return false;
    return true;
  }

  function findRow(el) {
    let n = el;
    for (let i = 0; i < MAX_DEPTH && n && n !== document.body; i++) {
      if (n.matches && n.matches(SELECTOR_ROW)) return n;
      // Also accept generic list rows inside the thread list.
      if (n.matches && (n.getAttribute('role') === 'row')) {
        // Ensure it lives inside the mail list, not contacts/chat.
        if (n.closest('div[role="main"]')) return n;
      }
      n = n.parentElement;
    }
    return null;
  }

  function hideRow(row) {
    if (!row || seen.has(row)) return false;
    seen.add(row);
    if (!row.classList.contains('gmx-ad-row')) {
      row.classList.add('gmx-ad-row');
      return true;
    }
    return false;
  }

  function maybeTopShelf(labelEl) {
    // Walk up to find a carousel/grid container holding 2+ sponsored cards
    // sitting above the thread list.
    let n = labelEl.parentElement;
    for (let i = 0; i < 10 && n && n !== document.body; i++) {
      if (n.querySelectorAll) {
        // Heuristic: container wider than tall grid with several sponsored labels.
        const labels = n.querySelectorAll('span');
        let c = 0;
        for (const s of labels) { if (isSponsoredLabel(s) && ++c >= 2) break; }
        if (c >= 2) {
          const main = n.closest('div[role="main"]');
          if (main && !seen.has(n)) {
            seen.add(n);
            n.classList.add('gmx-top-shelf');
            return true;
          }
          return false;
        }
      }
      n = n.parentElement;
    }
    return false;
  }

  function checkNode(node) {
    let hits = 0;
    try {
      if (node instanceof Element) {
        if (seen.has(node)) return 0;
        // Never ad-hide inside an opened message: real emails can contain
        // "Sponsored"/"Ad" marker text. Trackers/enhancements still run.
        const inMessage = node.closest ? !!node.closest('div.adn') : false;
        // Fast path 1: explicit ad marker Gmail sometimes sets.
        if (!inMessage && node.matches && node.matches('span[data-is-advertisement]')) {
          const row = findRow(node);
          if (row && settings.blockPromoted && hideRow(row)) hits++;
          if (settings.blockTopShelf && maybeTopShelf(node)) hits++;
          return hits;
        }
        // Fast path 2: the node itself is a sponsored badge.
        if (!inMessage && (node.tagName === 'SPAN' || node.tagName === 'DIV') && isSponsoredLabel(node)) {
          if (settings.blockPromoted) {
            const row = findRow(node);
            if (row && hideRow(row)) hits++;
          }
          if (settings.blockTopShelf && maybeTopShelf(node)) hits++;
          return hits;
        }
        // Fast path 3: subtree contains badges (only scan small subtrees).
        if (!inMessage && node.querySelectorAll && node.childElementCount <= 60) {
          const spans = node.querySelectorAll('span[data-is-advertisement]');
          for (const s of spans) {
            const row = findRow(s);
            if (row && settings.blockPromoted && hideRow(row)) hits++;
          }
          if (hits) {
            if (settings.blockTopShelf) for (const s of spans) { if (maybeTopShelf(s)) { hits++; break; } }
            return hits;
          }
          // Text scan fallback, capped: only direct small spans.
          const all = node.querySelectorAll('span');
          let scanned = 0;
          for (const s of all) {
            if (++scanned > 40) break;
            if (isSponsoredLabel(s)) {
              if (settings.blockPromoted) {
                const row = findRow(s);
                if (row && hideRow(row)) hits++;
              }
              if (settings.blockTopShelf && maybeTopShelf(s)) hits++;
              if (hits > 6) break;
            }
          }
        }
        // Enhancement helpers (cheap attribute checks).
        if (settings.hideChatMeet || settings.hideGemini || settings.hideStorage || settings.blockSidebarAds) {
          tagEnhancements(node);
        }
        // Privacy: 1px images.
        if (settings.privacy && node.tagName === 'IMG') checkTracker(node) && hits++;
        else if (settings.privacy && node.querySelectorAll) {
          const imgs = node.querySelectorAll('img[width="1"][height="1"], img[width="0"]');
          for (const im of imgs) { if (checkTracker(im)) hits++; if (hits > 10) break; }
        }
      }
    } catch { /* never break Gmail */ }
    return hits;
  }

  function checkTracker(img) {
    try {
      const w = img.getAttribute('width');
      const h = img.getAttribute('height');
      if ((w === '1' && h === '1') || w === '0') {
        const src = img.src || '';
        // Keep Google's own UI images; hide third-party pixels in message bodies.
        if (src && !src.includes('googleusercontent.com') && !src.includes('mail.google.com') && !src.includes('gstatic.com')) {
          if (!img.classList.contains('gmx-tracker')) img.classList.add('gmx-tracker');
          return true;
        }
      }
    } catch { /* ignore */ }
    return false;
  }

  function tagEnhancements(root) {
    try {
      const q = (sel) => {
        if (root.matches && root.matches(sel)) markHelper(root);
        if (root.querySelectorAll) {
          const els = root.querySelectorAll(sel);
          for (const e of els) markHelper(e);
        }
      };
      if (settings.hideChatMeet) {
        q('[aria-label="Chat and Spaces"], [aria-label="Meet"]');
      }
      if (settings.hideGemini) {
        q('[aria-label="Gemini"], [aria-label*="Gemini"]');
      }
      if (settings.hideStorage) {
        if (root.querySelectorAll) {
          const links = root.querySelectorAll('a[href*="one.google.com"]');
          for (const a of links) {
            const box = a.closest('div');
            if (box && !seen.has(box)) { seen.add(box); box.classList.add('gmx-hide-storage'); }
          }
        }
      }
      if (settings.blockSidebarAds) {
        if (root.querySelectorAll) {
          const links = root.querySelectorAll('a[href*="googleadservices"], a[href*="doubleclick"]');
          for (const a of links) {
            const box = a.closest('div');
            if (box && !seen.has(box)) { seen.add(box); box.classList.add('gmx-side-promo'); }
          }
        }
      }
    } catch { /* ignore */ }
  }

  function markHelper(el) {
    if (!el || seen.has(el)) return;
    seen.add(el);
    if (settings.hideChatMeet && (el.getAttribute('aria-label') === 'Chat and Spaces' || el.getAttribute('aria-label') === 'Meet')) {
      el.classList.add('gmx-hide-chatmeet');
    } else {
      el.classList.add('gmx-hide-gemini');
    }
  }

  /* ---------- batching ---------- */

  function requestSweep() {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      if (!settings.enabled) return;
      let hits = 0;
      // Process queued mutations (cap per frame to stay <1ms-ish).
      const batch = queued.splice(0, 400);
      for (const n of batch) hits += checkNode(n);
      if (hits) bump(hits);
      if (queued.length) requestSweep();
    };
    if ('requestAnimationFrame' in window) requestAnimationFrame(run);
    else setTimeout(run, 32);
  }

  function fullSweep() {
    if (!settings.enabled) return;
    let hits = 0;
    try {
      const badges = document.querySelectorAll('span[data-is-advertisement]');
      for (const s of badges) {
        if (s.closest && s.closest('div.adn')) continue; // never hide inside opened mail
        const row = findRow(s);
        if (row && settings.blockPromoted && hideRow(row)) hits++;
        if (settings.blockTopShelf && maybeTopShelf(s)) hits++;
        if (hits > 200) break;
      }
      if (hits < 50) {
        // Fallback text scan, tightly scoped to the thread list.
        const main = document.querySelector('div[role="main"]');
        const scope = main || document.body;
        if (scope) {
          const spans = scope.querySelectorAll('span');
          let scanned = 0;
          for (const s of spans) {
            if (++scanned > 600) break;
            if (s.closest && s.closest('div.adn')) continue; // never hide inside opened mail
            if (isSponsoredLabel(s)) {
              const row = findRow(s);
              if (row && settings.blockPromoted && hideRow(row)) hits++;
              if (hits > 60) break;
            }
          }
        }
      }
      // Enhancement + tracker sweep over existing DOM so turning a toggle ON
      // applies instantly without waiting for new mutations.
      if (settings.hideChatMeet || settings.hideGemini || settings.hideStorage || settings.blockSidebarAds) {
        tagEnhancements(document.body || document.documentElement);
      }
      if (settings.privacy && document.body) {
        const imgs = document.body.querySelectorAll('img[width="1"][height="1"], img[width="0"]');
        for (const im of imgs) { if (checkTracker(im)) hits++; if (hits > 200) break; }
      }
    } catch { /* ignore */ }
    if (hits) bump(hits);
  }

  /* ---------- boot ---------- */

  function boot() {
    loadSettings();
    applySettings(DEFAULTS); // instant pre-paint defaults; corrected when sync loads

    const obs = new MutationObserver((mutations) => {
      if (!settings.enabled) return;
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n instanceof Element || n instanceof Text) {
            queued.push(n instanceof Text ? (n.parentElement || n) : n);
          }
        }
      }
      // URL change (Gmail is an SPA) -> full rescan.
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(fullSweep, 400);
      }
      requestSweep();
    });

    const start = () => {
      try {
        obs.observe(document.documentElement, { childList: true, subtree: true });
      } catch {
        setTimeout(start, 50);
        return;
      }
      // Re-apply so <body> (possibly created after document_start) gets flags.
      applySettings(settings);
      fullSweep();
      // A couple of delayed sweeps catch lazy-rendered Promotions content.
      setTimeout(fullSweep, 1200);
      setTimeout(fullSweep, 4000);
    };

    if (document.documentElement) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });

    function unhideAll() {
      document.querySelectorAll('.gmx-ad-row,.gmx-top-shelf,.gmx-side-promo,.gmx-tracker').forEach((e) => {
        e.classList.remove('gmx-ad-row', 'gmx-top-shelf', 'gmx-side-promo', 'gmx-tracker');
      });
    }

    // Single entry point for realtime updates (direct message or storage event).
    function applyPatch(patch) {
      if (!patch) return;
      let dirty = false;
      for (const k of Object.keys(DEFAULTS)) {
        if (patch[k] !== undefined) { settings[k] = patch[k]; dirty = true; }
      }
      if (!dirty) return;
      applySettings(settings);
      const keys = Object.keys(patch);
      if (keys.length === 1 && keys[0] === 'theme') return; // theme is CSS-only
      if (!settings.enabled) unhideAll();
      else fullSweep();
    }

    // Popup toggles apply instantly, no reload.
    // Direct message = fastest path (no storage round-trip); storage event below
    // is the fallback (other tabs, sync propagation). Both are idempotent.
    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg && msg.type === 'gmx-apply' && msg.patch) applyPatch(msg.patch);
      });
    } catch { /* ignore */ }

    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        const patch = {};
        for (const k of Object.keys(DEFAULTS)) {
          if (changes[k]) patch[k] = changes[k].newValue;
        }
        applyPatch(patch);
      });
    } catch { /* ignore */ }
  }

  boot();
})();
