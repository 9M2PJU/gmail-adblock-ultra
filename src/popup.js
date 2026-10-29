// Popup wiring: loads settings + counter, saves instantly.
const DEFAULTS = {
  enabled: true,
  blockPromoted: true,
  blockTopShelf: true,
  blockSidebarAds: true,
  privacy: true,
  hideChatMeet: false,
  compact: false,
  hideGemini: false,
  hideStorage: false
};

const ids = Object.keys(DEFAULTS);
const els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const blockedEl = document.getElementById('blockedTotal');
const statusEl = document.getElementById('status');

function paintStatus(on) {
  statusEl.textContent = on ? 'Protecting Gmail' : 'Paused';
  statusEl.classList.toggle('off', !on);
}

// Realtime path: push the change straight to open Gmail tabs so it applies
// within a frame. chrome.storage.sync.set (below) persists it and covers any
// tab that missed the message. No extra permission needed: host permission
// for mail.google.com already allows messaging its content scripts.
function notifyTabs(patch) {
  try {
    if (!chrome.tabs || !chrome.tabs.query) return;
    chrome.tabs.query({ url: 'https://mail.google.com/*' }, (tabs) => {
      if (chrome.runtime.lastError || !tabs) return;
      for (const t of tabs) {
        if (t.id == null) continue;
        try {
          chrome.tabs.sendMessage(t.id, { type: 'gmx-apply', patch }, () => {
            void chrome.runtime.lastError; // ignore tabs without content script
          });
        } catch { /* ignore */ }
      }
    });
  } catch { /* ignore */ }
}

chrome.storage.sync.get(DEFAULTS, (s) => {
  for (const id of ids) els[id].checked = Boolean((s || DEFAULTS)[id]);
  paintStatus(els.enabled.checked);
});

chrome.storage.local.get({ blockedTotal: 0 }, (r) => {
  blockedEl.textContent = Number(r.blockedTotal || 0).toLocaleString();
});

for (const id of ids) {
  els[id].addEventListener('change', () => {
    const patch = { [id]: els[id].checked };
    chrome.storage.sync.set(patch);
    notifyTabs(patch); // instant; storage write is the durable fallback
    if (id === 'enabled') paintStatus(els[id].checked);
  });
}

document.getElementById('reset').addEventListener('click', () => {
  chrome.storage.sync.set(DEFAULTS, () => {
    for (const id of ids) els[id].checked = Boolean(DEFAULTS[id]);
    paintStatus(true);
  });
  notifyTabs({ ...DEFAULTS });
});
