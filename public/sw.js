self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("fitfamily-static-v1").then((cache) =>
      cache.addAll(["/", "/manifest.json", "/icons/icon-192.svg", "/icons/icon-512.svg"])
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open("fitfamily-dynamic-v1").then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});
