# AMO Listing — Gmail AdBlock

> Last Updated: 2026-10-29. Version 1.3.1 (MV2, `manifest.firefox.json`).

## Upload file

`dist/gmail-adblock-ultra-firefox-v1.3.1.zip` — manifest.json at zip root, 15 files.

## Validator status (addons-linter, 2026-10-29)

0 errors, 0 notices. Remaining warnings are all benign:
- `MISSING_ADDON_ID` — correct to omit; AMO assigns a GUID on first signing (MV2).
- `STORAGE_SYNC` ×8 — only affects temporary `about:debugging` loads without an ID.
- `KEY_FIREFOX_*_UNSUPPORTED_BY_MIN_VERSION` ×3 — `data_collection_permissions`
  needs FF 140+/Android 142+ and is ignored on older clients. Kept
  `strict_min_version: 109.0` for max compatibility; the value is `"none"`,
  which needs no consent UI anywhere.

## Listing copy

**Name**
Gmail AdBlock — Ultra Fast + Enhancements

**Summary (max 250 chars)**
Ultra-fast Gmail ad blocker. Hides Sponsored rows, top-picks carousels and tracking pixels. Plus inbox enhancements.

**Description**
Removes sponsored ads from your Gmail inbox and keeps promotional clutter out of the way.

Ad blocking:
- Hides Sponsored emails in Promotions and Social tabs, in 20+ languages
- Hides the Sponsored top-picks carousel above the email list
- Hides promotional side-rail links
- Blocks invisible 1px read-trackers in emails, on the page and at the network level, without reading your emails

Inbox options (apply instantly, no reload):
- Hide Chat & Meet sidebar, compact inbox density
- Hide Gemini upsell, hide Google One / storage upsell

Privacy: no personal data collected. Settings sync via your own Firefox account;
a blocked-ads counter stays on your device. Nothing goes to the developer or third parties.
Full policy: https://github.com/9M2PJU/gmail-adblock-ultra/blob/main/PRIVACY.md

Support: https://github.com/9M2PJU/gmail-adblock-ultra/issues
Donate: https://paypal.me/9M2PJU · https://buymeacoffee.com/9m2pju ·
https://wise.com/pay/me/faizulz13 · https://github.com/sponsors/9M2PJU

Version 1.3.1 — Same as 1.3.0 plus Android support declaration and store-metadata fixes.

**Categories**
Primary: Privacy & Security · Secondary: Productivity

**Homepage**: https://github.com/9M2PJU/gmail-adblock-ultra
**Support**: https://github.com/9M2PJU/gmail-adblock-ultra/issues
**Privacy policy**: https://github.com/9M2PJU/gmail-adblock-ultra/blob/main/PRIVACY.md
**License**: MIT License
**Firefox compatibility**: 109.0 and later, desktop and Android.
On Android, open mail.google.com in Desktop-site mode for full ad-blocking
(the mobile Gmail layout uses different markup); network-level tracker
blocking works in either mode.

## Permissions justification (reviewer notes field)

- `storage` — remembers on/off switches and the blocked-ads counter; syncs the
  user's own settings via their Firefox account. No data reaches the developer.
- `webRequest` + `webRequestBlocking` — cancels ad/tracker requests
  (googleadservices, doubleclick, googlesyndication, analytics collection) only
  when initiated from mail.google.com (origin-checked in code). MV2 equivalent
  of the Chrome build's network filtering; no page content is read.
- Host `https://mail.google.com/*` — extension runs only inside Gmail: hides
  Sponsored rows/carousels, applies inbox options, pushes popup changes to tabs.

## Data disclosure (AMO form)

`data_collection_permissions.required: ["none"]` in the manifest. No analytics,
no external requests, no remote code, no obfuscation. Consistent with PRIVACY.md.

## Screenshot

Reuse `store-assets/screenshot-1-1280x800.png` (1280×800). AMO accepts it;
optionally add a Gmail before/after shot later.

## Version history

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.3.1 | 2026-10-29 | Version bump for submission. | Draft |
| 1.3.0 | 2026-10-29 | No themes; added `data_collection_permissions: none` (AMO Nov-2025 requirement). | Superseded |
