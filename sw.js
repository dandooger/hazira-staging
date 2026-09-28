const CACHE = "hazira-stg-v1790609392387";
const SHELL = ["./", "index.html", "manifest.webmanifest", "data/index.json", "icons/icon-192-cheetah3.png", "icons/icon-512-cheetah3.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const shell = url.origin === location.origin && (url.pathname.endsWith("/") || url.pathname.endsWith("index.html") || url.pathname.endsWith("index.json") || url.pathname.endsWith(".webmanifest"));
  // the game page and the category list: fresh from the internet when possible (so updates arrive), cache when offline
  if (url.pathname.endsWith("version.json")) { e.respondWith(fetch(e.request, { cache: "no-store" })); return; }
  if (shell) { e.respondWith(fetch(e.request, { cache: "no-store" }).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request))); return; }
  // everything else (pictures, fonts): cache first
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
    return r;
  })));
});
