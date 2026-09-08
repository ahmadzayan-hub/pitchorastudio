// Pitchora Service Worker
// Handles offline shell, cache-first for static assets, network-first
// for pages, and stale-while-revalidate for icons + fonts.

const CACHE_VERSION = "pitchora-v0.6.0";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const OFFLINE_URL = "/offline";
const APP_SHELL = [
  "/presentiq",
  "/presentiq/pricing",
  "/presentiq/templates",
  "/presentiq/about",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) =>
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(new Request(url, { credentials: "same-origin" })).catch(() => null),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.url.includes("/api/")) return;

  // Navigation requests: network-first with offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(APP_SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return resp;
        })
        .catch(() =>
          caches.match(req).then((c) => c || caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // Static assets: cache-first, stale-while-revalidate.
  const isStatic =
    req.destination === "style" ||
    req.destination === "script" ||
    req.destination === "font" ||
    req.destination === "image";

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((resp) => {
            const copy = resp.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return resp;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
