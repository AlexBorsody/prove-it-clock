/**
 * Generates public/sw.js at build time with a timestamp-versioned cache name.
 * Every deploy gets a fresh cache; on activate the worker deletes ALL old
 * caches and takes over immediately (skipWaiting + clients.claim).
 *
 * Caching strategy (deliberately conservative, no stale-data bugs):
 * - /_next/static/*      cache-first   (content-hashed, immutable)
 * - navigations (HTML)   network-first, cache fallback when offline
 * - /api/*               network only  (never serve stale data)
 * - other same-origin    cache-first   (icons, manifest, images)
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
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
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
  event.respondWith(cacheFirst(request));
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
