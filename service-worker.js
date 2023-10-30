const cacheName = "2048PWA";
const appShellFiles = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./assets/2048-192x192.png",
  "./assets/2048-512x512.png",
  "./assets/2048-mobile-ui.png",
  "./assets/2048-og.png",
  "./assets/2048-UI.png",
  "./assets/animatedbg.gif",
  "./assets/arrow.png",
  "./assets/bg.gif",
  "./assets/defaultbg.png",
  "./assets/favicon.ico",
  "./assets/howtobg.png",
  "./assets/translate.svg",
];

const handlePWAInstall = (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(appShellFiles);
    })()
  );
};

const handleFetch = (event) => {
  event.respondWith(
    (async () => {
      const request = await caches.match(event.request);
      console.log(request);
      if (request) return request;

      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      await cache.put(event.request, response.clone());
      return response;
    })()
  );
};

self.addEventListener("install", handlePWAInstall);
self.addEventListener("fetch", handleFetch);
