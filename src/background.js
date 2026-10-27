// Gmail AdBlock — service worker. Minimal, event-driven (MV3-safe).
const DEFAULTS = {
  enabled: true,
  blockPromoted: true,
  blockTopShelf: true,
  blockSidebarAds: true,
  privacy: true,
  hideChatMeet: false,
  compact: false,
  hideGemini: false,
  hideStorage: false,
  theme: 'default'
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set(DEFAULTS);
    chrome.storage.local.set({ blockedTotal: 0, installedAt: Date.now() });
  } else if (details.reason === 'update') {
    // Merge new defaults without wiping user choices.
    chrome.storage.sync.get(DEFAULTS, (cur) => {
      chrome.storage.sync.set({ ...DEFAULTS, ...(cur || {}) });
    });
  }
});

// Keep the DNR privacy rule in sync with the toggle without extra permissions.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' || !changes.privacy) return;
  const on = changes.privacy.newValue !== false;
  chrome.declarativeNetRequest.updateEnabledRulesets(
    { [on ? 'enableRulesetIds' : 'disableRulesetIds']: ['gmail_ads'] },
    () => {}
  );
});
