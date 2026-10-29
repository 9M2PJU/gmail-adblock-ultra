# Privacy Policy for Gmail AdBlock

Last updated: 2026-10-29

## What Data We Collect

Gmail AdBlock does not collect, transmit, or share any personal data, browsing
history, email content, or analytics with the developer or any third party.

The only data the extension stores is your own configuration, kept in your
browser's extension storage:

- Your on/off switches (which ad-blocking and inbox options are enabled).
- A counter of blocked ads and trackers, plus the install date (used only to
  show the "ads & trackers blocked" number in the popup).

## How Data Is Stored

- Settings are stored with `chrome.storage.sync`, so your switches follow you
  across your own devices through your browser account sync (Google operates
  that sync infrastructure).
- The counter is stored with `chrome.storage.local` on your device only.
- Nothing is sent to the developer, to any analytics service, or to any
  third party. The extension makes no network requests of its own.

## How Data Is Used

Stored settings are used solely to apply your choices when Gmail loads.
The counter is used solely to display your blocked total in the popup.
Email bodies are never read, modified, or transmitted for ad detection —
sponsored rows are hidden with display-only rules, and never inside an
opened message.

## Third-Party Services

This extension does not use any third-party services, analytics, advertising
SDKs, or external servers.

## Data Sharing

No data is sold, shared, or disclosed to any third party for any purpose.

## Data Retention and Deletion

Settings and the counter persist until you change them, reset to defaults in
the popup, or uninstall the extension (uninstalling removes all extension
storage). You can reset everything at any time with the "Reset defaults"
button in the popup.

## Changes to This Policy

If data practices change, this policy will be updated and the extension's
store listing will note the change. Continued use after an update constitutes
acceptance of the revised policy.

## Contact

For privacy questions, contact: [TODO — publisher email] or open an issue at
https://github.com/9M2PJU/gmail-adblock-ultra/issues
