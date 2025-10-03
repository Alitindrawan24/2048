const cacheName = "2048PWA-v1";
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

// Install Service Worker
const handlePWAInstall = (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("Caching app shell files");
      await cache.addAll(appShellFiles);
    })()
  );
};

// Fetch Cached Content
const handleFetch = (event) => {
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      
      if (cachedResponse) {
        console.log("Returning cached resource:", event.request.url);
        return cachedResponse;
      }

      try {
        const response = await fetch(event.request);
        const cache = await caches.open(cacheName);
        console.log("Caching new resource:", event.request.url);
        await cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        console.error("Fetch failed:", error);
        throw error;
      }
    })()
  );
};

// Activate Service Worker and Clean Old Caches
const handleActivate = (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })()
  );
};

self.addEventListener("install", handlePWAInstall);
self.addEventListener("fetch", handleFetch);
self.addEventListener("activate", handleActivate);