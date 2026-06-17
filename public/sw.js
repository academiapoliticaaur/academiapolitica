const CACHE = "ami-moti-v3";

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

// Instalare: pre-cache assets statice
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activare: șterge cache-uri vechi
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first pentru pagini, cache-first pentru assets statice
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignoră: non-GET, cross-origin, API routes, Supabase
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  // Cache-first pentru assets statice (imagini, SVG, fonturi)
  if (
    url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|woff2|woff|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Network-first pentru pagini — cu fallback la cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline.html")))
  );
});
