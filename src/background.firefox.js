// Gmail AdBlock — Firefox (MV2) background page (persistent).
// webRequest replaces declarativeNetRequest; same block list, Gmail-scoped.
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

const BLOCK_URLS = [
  '*://*.googleadservices.com/*',
  '*://*.doubleclick.net/*',
  '*://*.googlesyndication.com/*',
  '*://*.google-analytics.com/collect*'
];

let privacyOn = true;
let masterOn = true;

chrome.storage.sync.get({ privacy: true, enabled: true }, (r) => {
  privacyOn = r.privacy !== false;
  masterOn = r.enabled !== false;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  if (changes.privacy) privacyOn = changes.privacy.newValue !== false;
  if (changes.enabled) masterOn = changes.enabled.newValue !== false;
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!privacyOn || !masterOn) return {};
    try {
      const origin = details.originUrl || details.documentUrl || '';
      if (typeof origin !== 'string' || origin.indexOf('https://mail.google.com') !== 0) return {};
    } catch {
      return {};
    }
    return { cancel: true };
  },
  { urls: BLOCK_URLS },
  ['blocking']
);

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
