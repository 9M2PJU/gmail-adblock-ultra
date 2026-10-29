# Chrome Web Store Listing — Gmail AdBlock

> Last Updated: 2026-10-29

## Store Listing

**Extension Name** [REQUIRED]
Gmail AdBlock — Ultra Fast + Enhancements
(Must match manifest.json "name" exactly. 38 characters, under the 75 max.)

**Short Description** [REQUIRED]
Ultra-fast Gmail ad blocker. Hides Sponsored rows, top-picks carousels and tracking pixels. Plus inbox enhancements.
(116 characters, under the 132 max. Matches manifest.json "description".)

**Detailed Description** [REQUIRED]
Removes sponsored ads from your Gmail inbox and keeps promotional clutter out of the way.

FEATURES
• Hides Sponsored emails in your Promotions and Social tabs, in 20+ languages
• Hides the Sponsored top-picks carousel above your email list
• Hides promotional side-rail links
• Blocks invisible 1px read-trackers in emails, on the page and at the network level, without reading your emails
• Optional inbox clean-up: hide Chat and Meet, compact row density, hide Gemini and storage upsells
• Every switch applies instantly, no page reload needed

HOW TO USE
1. Open https://mail.google.com/
2. Click the Gmail AdBlock icon in your toolbar
3. Turn features on or off — changes apply to open Gmail tabs immediately

PRIVACY
This extension does not collect personal data. Your on/off settings sync across
your devices through your browser account, and a blocked-ads counter is kept on
your device only. Nothing is ever sent to the developer or any third party.
See PRIVACY.md for the full policy.

PERMISSIONS
• "Storage" — remembers your switches and counter, and syncs settings across your devices.
• "Block content on mail.google.com" (network filtering) — stops ad and tracker
  requests inside Gmail without reading your page content.
• "Access mail.google.com" — the extension only runs inside Gmail, where it hides
  sponsored rows and applies your inbox options.

SUPPORT
Found a bug? Have a suggestion? Open an issue at
https://github.com/9M2PJU/gmail-adblock-ultra/issues

DONATE
Gmail AdBlock is free forever. If it cleans up your inbox, consider supporting development:
PayPal: https://paypal.me/9M2PJU
Buy Me a Coffee: https://buymeacoffee.com/9m2pju
Wise: https://wise.com/pay/me/faizulz13
GitHub Sponsors: https://github.com/sponsors/9M2PJU

Version 1.3.1 — Same as 1.3.0 plus Android support declaration and store-metadata fixes.

(CWS strips markdown: paste as plain text with line breaks. No implementation
details, no API names, no superlatives above.)

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Hides sponsored ads and tracking pixels in Gmail.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon128.png |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ✅ Ready | store-assets/screenshot-1-1280x800.png |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
`store-assets/screenshot-1-1280x800.png` — real popup render (fresh-install defaults)
on the left, truthful feature bullets on the right. 1280×800 exact.
Recommended additions (capture yourself in Chrome at 1280×800):
2. Gmail Promotions tab with a Sponsored row hidden (before/after, annotated).
3. Inbox with Hide Chat & Meet + Compact density enabled (annotated).

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| storage | permissions | Remembers the user's on/off switches and blocked-ads counter; syncs settings across the user's own devices via their browser account. |
| declarativeNetRequest | permissions | Blocks ad/tracker network requests (googleadservices, doubleclick, googlesyndication, analytics collection) inside Gmail without reading page content. |
| https://mail.google.com/* | host_permissions | The extension only functions inside Gmail. Needed to hide Sponsored rows/carousels, apply inbox options, and push popup switch changes to open Gmail tabs instantly. Scoped to mail.google.com only — no other sites. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No — nothing is collected by, transmitted to,
or shared with the developer or any third party.

Stored on-device / in the user's own browser account sync (never sent to the developer):
- Toggle settings (which blocking/enhancement switches are on) — `chrome.storage.sync`
  (Google syncs this between the user's own devices; counts as off-device transmission
  on the CWS disclosure form — declare "stored data synced via browser account").
- Blocked-ads counter + install timestamp — `chrome.storage.local` (device only).

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | No |
| Health info | No | No | — | No |
| Financial info | No | No | — | No |
| Authentication info | No | No | — | No |
| Personal communications | No | No | — | No |
| Location | No | No | — | No |
| Web history | No | No | — | No |
| User activity | No | No | — | No |
| Website content | No | No | — | No |

Note for the disclosure form: settings stored in `chrome.storage.sync` are transmitted
to Google's servers for the user's own cross-device sync. No analytics, no fetch/XHR
to any server, no remote code, no obfuscation. Email bodies are never read or modified
for ad hiding (hiding is display-only, badge-based, list rows only).

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/9M2PJU/gmail-adblock-ultra/blob/main/PRIVACY.md
(Live, verified 2026-10-29. Keep in sync with PRIVACY.md on main.)

## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
9M2PJU

**Contact Email** [REQUIRED]
⬜ TODO — must be a monitored address (Google sends takedown/policy notices here).

**Support URL / Email** [RECOMMENDED]
https://github.com/9M2PJU/gmail-adblock-ultra/issues

**Homepage URL** [RECOMMENDED]
https://github.com/9M2PJU/gmail-adblock-ultra

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.3.1 | 2026-10-29 | Version bump for resubmission (1.3.0 never published). | Draft |
| 1.3.0 | 2026-10-29 | Removed inbox themes; manifest description shortened to 116 chars (CWS 132 limit); README excluded from submission ZIP per review checklist. | Superseded |
| 1.2.4 | 2026-10-28 | Reverted email inversion; message bodies keep sender design; ad-hider banned inside opened mail. | Not submitted |

## Review Notes

### Known Issues / Limitations
- **Trademark**: the name and copy reference "Gmail" (a Google trademark) to describe
  compatibility — standard practice for single-site extensions, but a strict reviewer
  could flag it. If flagged, rename to "AdBlock for Gmail"-style phrasing per reviewer
  guidance rather than guessing.
- **Superlative**: "Ultra Fast" in the name is mild marketing language. It describes
  measurable behavior (CSS-first injection before first paint, sub-millisecond
  batched observer) but cannot be externally verified — accepted risk, reword if flagged.
- No `tabs` permission is declared on purpose: the popup messages open Gmail tabs via
  existing host permission, with storage events as fallback. Do not add `tabs` unless
  a reviewer explicitly requires it.

### Rejection History
| Date | Reason | Fix Applied | Resubmitted |
|------|--------|-------------|-------------|
| — | — | — | — |
