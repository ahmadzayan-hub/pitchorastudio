// Background service worker — handles network calls to the SaaS API.
const DEFAULTS = {
  apiBase: "http://localhost:3000",
  apiKey: "dev-extension-key"
};

async function getConfig() {
  const cfg = await chrome.storage.sync.get(["apiBase", "apiKey"]);
  return {
    apiBase: cfg.apiBase || DEFAULTS.apiBase,
    apiKey: cfg.apiKey || DEFAULTS.apiKey
  };
}

async function callEnhance(payload) {
  const cfg = await getConfig();
  const res = await fetch(`${cfg.apiBase}/api/extension/enhance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === "ENHANCE") {
        const data = await callEnhance(msg.payload);
        sendResponse({ ok: true, data });
      } else {
        sendResponse({ ok: false, error: "unknown_message" });
      }
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true; // async
});
