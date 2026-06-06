const CACHE_NAME = "chestny-otzyv-v1";

// Установка
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["./", "./index.html"])
    )
  );
});

// Активация — чистим старые кэши
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ОДИН обработчик fetch (Network First)
self.addEventListener("fetch", (e) => {
  // Только GET-запросы
  if (e.request.method !== "GET") return;

  // НЕ трогаем Firebase / Google
  const url = e.request.url;
  if (
    url.includes("firestore") ||
    url.includes("googleapis") ||
    url.includes("gstatic") ||
    url.includes("firebase")
  ) {
    return; // пусть грузится напрямую из сети
  }

  // Network First: сначала сеть, потом кэш
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
