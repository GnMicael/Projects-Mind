// Service worker simples e defensivo: nunca deve quebrar o carregamento do site.
// Dados do Firebase (outros domínios) NÃO passam por aqui.
const V = 'pm-v2';
const SHELL = ['/index.html', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', (e) => {
  // allSettled: se um item falhar, a instalação não falha
  e.waitUntil(caches.open(V).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function pagina(r) {
  try { return await fetch(r); } catch {
    const cached = await caches.match('/index.html');
    return cached || new Response('Sem conexão. Verifique a internet e recarregue a página.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
async function arquivo(r) {
  const hit = await caches.match(r);
  if (hit) return hit;
  try {
    const res = await fetch(r);
    if (res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)).catch(() => {}); }
    return res;
  } catch { return new Response('', { status: 504 }); }
}

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // só o próprio site; /__/ é do login do Firebase; o sw.js nunca é interceptado
  if (u.origin !== self.location.origin || u.pathname.startsWith('/__/') || u.pathname === '/sw.js') return;
  if (r.mode === 'navigate') { e.respondWith(pagina(r)); return; }
  if (u.pathname.startsWith('/assets/') || /\.(png|svg|webmanifest|woff2?)$/.test(u.pathname)) { e.respondWith(arquivo(r)); return; }
  // qualquer outra requisição: o navegador resolve sozinho, sem service worker
});
