const CACHE_NAME = "spare-shop-v3";

/* Files we want cached immediately */
const STATIC_ASSETS = [
  "/",
  "/boot.html",
  "/dashboard.html",
  "/index.html",
  "/icon-192x192.png",
  "/icon-512x512.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {

  const request = event.request;

  /* 🔥 NEVER CACHE HTML (important for Firebase auth) */
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(fetch(request));
    return;
  }

  /* CACHE-FIRST STRATEGY FOR STATIC FILES */
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {

        /* Only cache valid responses */
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });

        return networkResponse;
      });
    })
  );
});
