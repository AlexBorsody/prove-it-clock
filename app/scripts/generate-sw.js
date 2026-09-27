/**
 * Generates public/sw.js at build time with a timestamp-versioned cache name.
 * Every deploy gets a fresh cache; on activate the worker deletes ALL old
 * caches and takes over immediately (skipWaiting + clients.claim).
 *
 * Caching strategy (deliberately conservative, no stale-data bugs):
 * - /_next/static/*      cache-first   (content-hashed, immutable)
 * - navigations (HTML)   network-first, cache fallback when offline
 * - /api/*               network only  (never serve stale data)
 * - other same-origin    network only (includes dynamic Next RSC data)
 * - cross-origin         untouched
 */
const fs = require("fs");
const path = require("path");

const BUILD_ID = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14); // YYYYMMDDHHMMSS

const sw = `/* Prove Value service worker — generated at build time. Do not edit by hand. */
/* Build: ${BUILD_ID} */
const CACHE = "prove-value-${BUILD_ID}";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.pathname.startsWith("/api/")) return; // network only, never stale
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  // Next client navigations are fetches outside /api, not document navigations.
  // Let them and other non-immutable resources reach the network.
});

// Push notifications: payload is { title, body, url, tag }, all set server-side.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = {};
  }
  const title = typeof data.title === "string" && data.title ? data.title : "Prove Value";
  const body = typeof data.body === "string" ? data.body : "";
  const url = typeof data.url === "string" && data.url.startsWith("/") ? data.url : "/";
  const tag = typeof data.tag === "string" ? data.tag : undefined;
  event.waitUntil(
    self.registration.showNotification(title, { body, tag, data: { url } })
  );
});

// Tapping a notification deep-links to the promise/evidence in the ledger.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus().then((c) => {
              if ("navigate" in c) return c.navigate(url);
              return c;
            });
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
        return undefined;
      })
  );
});
`;

const out = path.join(__dirname, "..", "public", "sw.js");

// Clear any previously generated worker first: every build starts clean,
// so a failed generation can never leave a stale sw.js behind.
try {
  fs.unlinkSync(out);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

fs.writeFileSync(out, sw);
console.log("sw.js generated, cache:", "prove-value-" + BUILD_ID);
