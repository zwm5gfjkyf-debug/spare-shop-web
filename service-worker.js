const CACHE_NAME = "spare-shop-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/add.html",
  "/sales.html",
  "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
