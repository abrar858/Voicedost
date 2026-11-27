// VoiceDost service worker: lets the site install as an app and shows a
// friendly page when offline. Everything else goes straight to the network.
const OFFLINE = "/offline.html";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("voicedost-v1").then((c) => c.add(OFFLINE)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});
