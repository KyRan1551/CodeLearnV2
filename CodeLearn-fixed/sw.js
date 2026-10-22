const CACHE = "codelearn-v7";

const ASSETS = [
  "./", "./index.html", "./manifest.json", "./icon.svg",
  "./style.css", "./skills.css", "./effects.css",
  "./effects.js", "./skills.js",
  "./js/config.js", "./js/data.js", "./js/tests.js", "./js/state.js",
  "./js/utils.js", "./js/pages.js", "./js/navigation.js", "./js/editor.js",
  "./js/code-editor.js", "./js/workspace.js", "./js/events.js",
  "./js/router.js", "./js/main.js"
];


self.addEventListener("install", (event) => {
  // allSettled: один отсутствующий файл больше не ломает установку SW
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url))).then((results) => {
        results.forEach((r, i) => {
          if (r.status === "rejected") console.warn("[SW] Не удалось закэшировать:", ASSETS[i]);
        });
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.origin === location.origin) {
    // Свои файлы: сначала сеть, без сети — кэш
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            // index.html подставляем только при переходе по страницам, а не вместо CSS/JS
            if (req.mode === "navigate") return caches.match("./index.html");
            return Response.error();
          })
        )
    );
  } else {
    // Шрифты и CDN: сначала кэш, в фоне обновляем
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok || res.type === "opaque") {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
