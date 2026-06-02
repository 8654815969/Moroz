const CACHE_NAME = "chestny-otzyv-" + new Date().getTime();

// Установка — кэшируем основные файлы
self.addEventListener("install", (e) => {
  self.skipWaiting(); // сразу активируем новую версию
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["./", "./index.html"])
    )
  );
});

// Активация — удаляем старые кэши
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // чистим старьё
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Запросы — "Network First": сначала интернет, потом кэш
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // получили свежую версию — обновляем кэш
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request)) // нет интернета — берём из кэша
  );
});
