// Service worker simples: abre o app mesmo com internet ruim. Dados do Firebase NÃO são cacheados aqui.
const V = 'pm-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // só o próprio site; /__/ é do login do Firebase e nunca deve ser interceptado
  if (u.origin !== location.origin || u.pathname.startsWith('/__/')) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/index.html'))); return; }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => {
    if (res.ok && (u.pathname.startsWith('/assets/') || /\.(png|svg|webmanifest|woff2?)$/.test(u.pathname))) {
      const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy));
    }
    return res;
  })));
});
